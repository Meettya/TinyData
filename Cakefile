###
New Cakefile with good organization
###

path  = require 'path'
fs    = require 'fs'
_     = require 'underscore'
async = require 'async'

root_path = path.dirname fs.realpathSync __filename

project_name = 'TinyData'
project_file_name = 'tinydata'

paths = 
  cake_dep          : 'cake_dep'
  src_dir           : 'src'
  lib_dir           : 'lib'
  lib_browser_dir   : 'lib_browser'
  test_dir          : 'test'
  develop_dir       : 'develop_suite'
  test_browser_dir  : 'test_browser'
  example_dir       : 'example'

# extend path with root
_.each paths, (value, key, list) -> list[key] = path.join root_path, value

# add commands
commands = require path.join paths.cake_dep, 'command'

# add dev_server
{dev_server} = require path.join paths.cake_dep, 'dev_server'

###
Now tasks
###

task 'pre_commit', 'build all before commit', pre_commit = (cb) ->
  async.series [ test_coffee, build_lib_node, build_lib_node_dependency, prepare_all_for_browser ], (err) ->
      console.log "#{err}".error if err?
      console.log ' Pre-commit: all done!'.out

task 'test_coffee', 'test module for node.js', test_coffee = (cb) ->
  commands.test_coffee cb, paths.test_dir

task 'compile_for_node', 'compile module for use in node', compile_for_node = (cb) ->
  async.series [ test_coffee, build_lib_node, build_lib_node_dependency ], (err) ->
    console.log "#{err}".error if err?
    console.log ' Node.js: all done!'.out

task 'compile_for_browser', 'compile module for use in browser', compile_for_browser = (cb) ->
  async.series [ test_coffee, build_lib_browser, minify_lib_browser ], (err) ->
    console.log "#{err}".error if err?
    console.log ' Browser: all done!'.out
      
task 'prepare_all_for_browser', 'create suite for test in browser, build docs', prepare_all_for_browser = (cb) ->

  prepare = (cb) ->
    async.series [ test_coffee, build_lib_browser, minify_lib_browser, copy_lib_to_test_browser ], (err) ->
      console.log "#{err}".error if err?
      console.log ' Browser: test suite ready!'.out
  
  async.parallel [ prepare, build_html_browser_page, build_test_browser_js, 
    copy_vendor_to_test_browser, copy_css_to_test_browser,
    copy_bootstrap_to_test_browser, build_example_data  ]

task 'build_html_browser_page', 'build html form jade for browser', build_html_browser_page = (cb) ->
  commands.compile_jade cb, path.join(paths.develop_dir, 'views'), paths.test_browser_dir

task 'start_dev_server', 'start developer server', start_dev_server = (cb) ->
  dev_server project_name, project_file_name, root_path
 
###
EX-task below, now just function
###

#task 'build_lib_node', 'build module from source for node.js', 
build_lib_node = (cb) ->
  commands.build_coffee cb, paths.src_dir, paths.lib_dir, /\.coffee$/

# this for TinyData dependency
build_lib_node_dependency = (cb) ->
  build_lib_node_internal_lib( build_lib_node_internal_mixin cb )

build_lib_node_internal_lib = (cb) ->
  internal_lib_dir = path.join paths.src_dir, 'lib'
  internal_lib_lib_dir = path.join paths.lib_dir, 'lib'
  commands.build_coffee cb, internal_lib_dir, internal_lib_lib_dir, /\.coffee$/

build_lib_node_internal_mixin = (cb) ->
  internal_mixin_dir = path.join paths.src_dir, 'mixin'
  internal_mixin_lib_dir = path.join paths.lib_dir, 'mixin'
  commands.build_coffee cb, internal_mixin_dir, internal_mixin_lib_dir, /\.coffee$/

#task 'build_lib_browser', 'build stitched module for browser', 
build_lib_browser = (cb) ->
  commands.build_stitched_js cb, paths.src_dir, paths.lib_browser_dir, project_file_name

#task 'minify_lib_browser', 'minify builded module for browser', 
minify_lib_browser = (cb) ->
  commands.minify_browser_lib cb, paths.lib_browser_dir, project_file_name

#task 'build_test_browser_js', 'build test js for browser', 
build_test_browser_js = (cb) ->
  commands.build_coffee cb, paths.test_dir, path.join(paths.test_browser_dir, 'test'), /-(?:stress_)?test\.coffee$/

#task 'copy_lib_to_test_browser', 'copy library to browser test', 
copy_lib_to_test_browser = (cb) ->
  commands.copy_dir cb, paths.lib_browser_dir, path.join(paths.test_browser_dir, 'js')

#task 'copy_vendor_to_test_browser', 'copy vendor js to browser test', 
copy_vendor_to_test_browser = (cb) ->
  vendor_dir = path.join paths.develop_dir, 'public', 'vendor'
  commands.copy_dir cb, vendor_dir, path.join(paths.test_browser_dir, 'vendor')

#task 'copy_css_to_test_browser', 'copy css to browser test', 
copy_css_to_test_browser = (cb) ->
  css_dir = path.join paths.develop_dir, 'public', 'css'
  commands.copy_dir cb,css_dir, path.join(paths.test_browser_dir, 'css')

#task 'copy_css_to_test_browser', 'copy css to browser test', 
copy_bootstrap_to_test_browser = (cb) ->
  css_dir = path.join paths.develop_dir, 'public', 'bootstrap'
  commands.copy_dir cb,css_dir, path.join(paths.test_browser_dir, 'bootstrap')

#task 'build_example_data', 'build_example_data', 
build_example_data = (cb) ->
  commands.build_json cb, paths.example_dir, path.join(paths.test_browser_dir, 'example'), /_data.coffee$/
