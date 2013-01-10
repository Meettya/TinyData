#!/usr/bin/env coffee

stitch      = require 'stitch'
stylus      = require 'stylus'
express     = require 'express'
path        = require 'path'
fs          = require 'fs'
coffee      = require 'coffee-script'
livereload  = require 'livereload2'

require './colorizer'

# read coffee, than compile and return result
read_and_compile_from_coffee = (root_path, dir_name, file_name, cb) ->
  fs.readFile (path.join root_path, dir_name, "#{file_name}.coffee"), 'utf8', (err, data) ->
    throw err if err
    cb coffee.compile data

# require data and return it for JSON
require_and_return_data = (root_path, dir_name, file_name) ->
  data = require path.join root_path, dir_name, "#{file_name}.coffee"


###
This function create developer server to work with project or docs
###
dev_server = (project_name, file_name, root_path) ->

  port = process.env.PORT or 3000

  my_package = stitch.createPackage(
    # Specify the paths you want Stitch to automatically bundle up
    paths: [
      path.join root_path, "/src"
    ]
    # Specify your base libraries
    dependencies: [
    ]
  )

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
    read_and_compile_from_coffee root_path, 'test', filename, (data) =>
      res.type 'application/json'
      res.send data

  # this is our example files
  app.get '/example/:filename', (req, res) -> 
    [filename, ext] = req.param('filename').split '.'
    data = require_and_return_data root_path, 'example', filename,
    res.type 'application/json'
    res.send data


  # our widget
  app.get "/js/#{file_name}.js", my_package.createServer()

  console.log "Starting server on port: #{port}".info
  app.listen port

  # live reload suport
  livereload_server = livereload.createServer exts: ['less', 'jade']
  livereload_server.watch path.join root_path, '/develop_suite'

module.exports = 
  dev_server        : dev_server
