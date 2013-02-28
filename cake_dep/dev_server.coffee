#!/usr/bin/env coffee

stitch      = require 'stitch'
stylus      = require 'stylus'
express     = require 'express'
path        = require 'path'
fs          = require 'fs'
livereload  = require 'livereload2'
Clinch      = require 'clinch'

require './colorizer'

packer = new Clinch()

# this function will create package on the fly
clinch_on_the_fly = (root_path, dir_name, file_name, cb) ->
  
  pack_config = 
    bundle : 
      test_suite : path.join root_path, dir_name, file_name
    replacement :
      lodash : path.join root_path, "web_modules", "lodash"

  packer.buldPackage 'tinydata_package', pack_config, cb


# require data and return it for JSON
require_and_return_data = (root_path, dir_name, file_name) ->
  data = require path.join root_path, dir_name, "#{file_name}.coffee"


###
This function create developer server to work with project or docs
###
dev_server = (project_name, file_name, root_path) ->

  port = process.env.PORT or 3000

  pack_config = 
    bundle : 
      TinyData : path.join root_path, "src", "tinydata"
    replacement :
      lodash : path.join root_path, "web_modules", "lodash"

  app = express()
  app.locals.pretty = true

  app.configure ->
    app.set 'views', path.join root_path, '/develop_suite/views'
    app.set 'view engine', 'jade'

    # its for stylus pre-compiller
    app.use stylus.middleware 
      src     : path.join root_path, '/develop_suite/public'
      force   : true

    app.use express.favicon()

    app.use express.static path.join root_path, '/develop_suite/public'
    
  # static page
  app.get '/', (req, res) -> res.redirect 301, '/index.html'

  # this is our jade files
  app.get '/:html_name', (req,res) ->
    [filename, ext] = req.param('html_name').split '.'
    res.render filename

  # this is our test files
  app.get '/test/:filename', (req, res) -> 
    [filename, ext] = req.param('filename').split '.'
    clinch_on_the_fly root_path, 'test', filename, (err, data) ->
      res.type 'application/json'
      res.send data

  # this is our example files
  app.get '/example/:filename', (req, res) -> 
    [filename, ext] = req.param('filename').split '.'
    data = require_and_return_data root_path, 'example', filename,
    res.type 'application/json'
    res.send data

  # our widget
  app.get "/js/#{file_name}.js", (req, res) ->
    packer.buldPackage 'tinydata_package', pack_config, (err, data) ->
      res.type 'application/json'
      res.send data

  console.log "Starting server on port: #{port}".info
  app.listen port

  # live reload suport
  livereload_server = livereload.createServer exts: ['less', 'jade']
  livereload_server.watch path.join root_path, '/develop_suite'

module.exports = 
  dev_server        : dev_server
