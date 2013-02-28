###
This is command library

to wipe out Cakefile from realization 
###

path          = require 'path'
fs            = require 'fs-extra'
{spawn, exec} = require 'child_process'
Stitch        = require 'stitch'
UglifyJS      = require 'uglify-js'
async         = require 'async'
Clinch        = require 'clinch'
_             = require 'lodash'


packer = new Clinch()

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

build_clinched_js = (cb, source_dir, result_dir, result_filename) ->
  pack_config = 
    bundle : 
      TinyData : path.join source_dir, result_filename
    replacement :
      lodash : path.join source_dir, '..', "web_modules", "lodash"

  packer.buldPackage 'tinydata_package', pack_config, (err, source) ->
    throw err if err?
    fs.writeFile "#{path.join result_dir, result_filename}.js", source, encoding='utf8', (err) ->
      throw err if err?
      console.log "Compiled #{result_filename}.js".info
      cb() if typeof cb is 'function'
  null

build_clinched_js_files = (cb, source_dir, result_dir, filter) ->
  files = make_files_list source_dir, filter

  alldone = _.after(files.length, cb);

  for file in files
    build_clinched_js alldone, source_dir, result_dir, path.basename file, '.coffee'

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

build_json = (cb, source_dir, result_dir, filter) ->
  files = make_files_list source_dir, filter
  for file in files
    filename = path.basename file, '.coffee'
    result_filename = path.join result_dir, "#{filename}.json"
    data = JSON.stringify require(file), null, 2
    fs.writeFile result_filename, data, encoding='utf8', (err) ->
      throw err if err?
      console.log " -> json file |#{filename}| build done".info
      cb() if typeof cb is 'function'    

###
This is node.js version of bash gh-pages updater, now in color! :)
###
update_gh_pages = (cb, document_directory, gh_pages_branch) ->

  # internal spawn helper
  git_spawn_helper = (cb, command, args...) =>
    #console.log args
    git_spawn = spawn 'git', [command].concat args
    git_spawn.stderr.on 'data', (buffer) -> cb "#{buffer}".error
    git_spawn.on 'exit', (status) ->
      process.exit(1) if status != 0
      if command is 'update-ref'
        cb null, 'OK'
    git_spawn.stdout.on 'data', (data) ->
      cb null, "#{data}".trim()

  # start magic engine
  async.auto

    get_gh_pages_sha : (cb) ->
      git_spawn_helper cb, 'rev-parse', gh_pages_branch

    get_doc_dir_sha : (cb) ->
      git_spawn_helper cb, 'rev-parse', "master:#{document_directory}"

    get_doc_commit_message : (cb) ->
      git_spawn_helper cb, 'log', "--format='%s'", '-n', 1 , document_directory

    create_new_commit : [
      'get_gh_pages_sha'
      'get_doc_dir_sha'
      'get_doc_commit_message'

      (cb, results) ->
        #this works at git version 1.8.0.2, and NOT WORK at 1.7 - update git
        git_spawn_helper cb, 'commit-tree',
          '-p', results.get_gh_pages_sha,
          '-m', results.get_doc_commit_message,
          results.get_doc_dir_sha
    ]

    save_commit : [
      'create_new_commit'
      (cb, results) ->
        git_spawn_helper cb, 'update-ref',
          gh_pages_branch,
          results.create_new_commit
    ]

    # finalizer
    (err, results) ->
      if err
        console.log err 
        process.exit 1

      console.log results.save_commit 
      console.log 'Update for GitHub pages done'.info


module.exports = 
  build_coffee        : build_coffee
  test_coffee         : test_coffee
  build_stitched_js   : build_stitched_js
  build_clinched_js   : build_clinched_js
  build_clinched_js_files : build_clinched_js_files
  minify_browser_lib  : minify_browser_lib
  compile_jade        : compile_jade
  copy_dir            : copy_dir
  build_json          : build_json
  update_gh_pages     : update_gh_pages


