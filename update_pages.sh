#!/bin/bash

doc_dir='test_browser' # document directory
tmp_message='tmp_mess' # temporary files for changelog message
gh_pages='refs/heads/gh-pages' # refs to pages

parent_sha=$(git show-ref -s $gh_pages)
doc_sha=$(git ls-tree -d HEAD $doc_dir | awk '{print $3}')
git log --pretty=format:'%s' -n 1 $doc_dir > $tmp_message
new_commit=$(git commit-tree $doc_sha -p $parent_sha < $tmp_message )
rm $tmp_message
git update-ref $gh_pages $new_commit

echo "Update for GitHub pages done"