###
This is command library

to wipe out Cakefile from realization 
###

path          = require 'path'
fs            = require 'fs-extra'
{spawn, exec} = require 'child_process'
Stitch        = require 'stitch'
UglifyJS      = require 'uglify-js'

# add color to console
module.exports = require './colorizer'

###
Just proc extender
###
proc_extender = (cb, proc) =>
  proc.stderr.on 'data', (buffer) -> console.log "#{buffer}".error
  # proc.stdout.on 'data', (buffer) -> console.log  "#{buffer}".info
  proc.on        'exit', (status) ->
    process.exit(1) if status != 0
    cb() if typeof cb is 'function' 
  null

# Run a CoffeeScript through our node/coffee interpreter.
run_coffee = (args, cb) =>
  proc_extender cb, spawn 'node', ['./node_modules/.bin/coffee'].concat(args)

# Run a mocha tests
run_mocha = (args, cb) =>
  proc_extender cb, spawn 'node', ['./node_modules/.bin/mocha'].concat(args)

# Run jade compiler
run_jade = (args, cb) =>
  proc_extender cb, spawn 'node', ['./node_modules/.bin/jade'].concat(args)

###
Generate array of files from directory, selected on filter as RegExp
###
make_files_list = (in_dir, filter_re) ->
  for file in fs.readdirSync in_dir when file.match filter_re
    path.join in_dir, file 

###
CoffeeScript-to-JavaScript builder
###
build_coffee = (cb, source_dir, result_dir, filter) ->
  files = make_files_list source_dir, filter
  run_coffee ['-c', '-o', result_dir].concat(files), ->
    console.log ' -> build done'.info
    cb() if typeof cb is 'function' 
  null

test_coffee = (cb, test_dir) ->
  files = make_files_list test_dir, /-test\.coffee$/
  run_mocha files, ->
    console.log ' -> all tests passed :)'.info
    cb() if typeof cb is 'function'
  null

build_stitched_js = (cb, source_dir, result_dir, result_filename) ->
  my_package = Stitch.createPackage paths : [source_dir]
  my_package.compile (err, source) ->
    fs.writeFile "#{path.join result_dir, result_filename}.js", source, encoding='utf8', (err) ->
      throw err if err?
      console.log "Compiled #{result_filename}.js".info
      cb() if typeof cb is 'function'
  null

minify_browser_lib = (cb, result_dir, result_filename) ->
  minify_result = UglifyJS.minify path.join result_dir, "#{result_filename}.js"
  fs.writeFile "#{path.join result_dir, result_filename}.min.js", minify_result.code, encoding='utf8', (err) ->
    throw err if err?
    console.log "Compiled #{result_filename}.min.js".info
    cb() if typeof cb is 'function'
  null

compile_jade = (cb, source_dir, result_dir) ->
  files = make_files_list source_dir, /\.jade$/
  run_jade ['--pretty', '--no-debug', '--out', result_dir].concat(files), ->
    console.log ' -> build test html for browser done'.info
    cb() if typeof cb is 'function'

copy_dir = (cb, source_dir, result_dir) ->
  result_dirname = result_dir.split(path.sep).pop()
  fs.copy source_dir, result_dir, (err) ->
    throw err if err?
    console.log " -> directory |#{result_dirname}| copy done".info
    cb() if typeof cb is 'function'

module.exports = 
  build_coffee        : build_coffee
  test_coffee         : test_coffee
  build_stitched_js   : build_stitched_js
  minify_browser_lib  : minify_browser_lib
  compile_jade        : compile_jade
  copy_dir            : copy_dir
