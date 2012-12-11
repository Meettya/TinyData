#!/usr/bin/env coffee

stitch    = require 'stitch'
stylus    = require 'stylus'
express   = require 'express'
path      = require 'path'
fs        = require 'fs'
coffee    = require 'coffee-script'

require './colorizer'

# read coffee, than compile and return result
read_and_compile_to_coffee = (root_path, file_name, cb) ->
  fs.readFile (path.join root_path, 'test', "#{file_name}.coffee"), 'utf8', (err, data) ->
    throw err if err
    cb coffee.compile data


###
This function create developer server to work with project or docs
###
dev_server = (project_name, file_name, root_path) ->

  # hm, its works :)
  # routes = require path.join root_path, 'develop_suite', 'routes'

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
    read_and_compile_to_coffee root_path, filename, (data) =>
      res.type 'application/json'
      res.send data


  # our widget
  app.get "/js/#{file_name}.js", my_package.createServer()

  console.log "Starting server on port: #{port}".info
  app.listen port

module.exports = 
  dev_server        : dev_server
