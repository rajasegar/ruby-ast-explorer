# ruby-ast-explorer

AST Explorer lets you to visualize your ruby code as AST(Abstract Syntax Trees). 

This uses the [parser](https://github.com/whitequark/parser) gem to convert the source code into ASTs 
and the [TreeWriter](https://www.rubydoc.info/github/whitequark/parser/Parser/TreeRewriter) class
of the gem to apply transformations on the AST nodes and convert them back to source code.

We can take the transformation logic and put into a ruby file like `transform.rb` and use 
the same to do large scale refactorings with your ruby code base using a tool like [codeshift](https://github.com/rajasegar/codeshift).

```sh
$ codeshift -t transform.rb app/models/**/*.rb
```

## Export as gist
You can also export the source and transform code as gist to your Github account by clicking
the `Export as gist` button. But before that you need to sign in with Github and give permission to create gists for this app named ruby-ast-explorer.


And with that you can directly use the transform from your gist.
```sh
$ codeshift -t https://gist.githubusercontent.com/[user]/.../transform.rb  app/models/**/*.rb
```

It has got four panes with the following content:

* Top-Left => Original Source Code
* Top-Right => AST in Tree and S-expressions formats
* Bottom-Left => Transform Class
* Bottom-Right => Output

![screenshot](https://github.com/rajasegar/ruby-ast-explorer/blob/master/public/screenshot.png)


## Reference:
* https://whitequark.org/blog/2013/04/26/lets-play-with-ruby-code/
* https://blog.arkency.com/using-ruby-parser-and-ast-tree-to-find-deprecated-syntax/
* https://blog.arkency.com/rewriting-deprecated-apis-with-parser-gem/
* https://gist.github.com/jonatas/e70c874cbbd0cac5a9abd9f4a78fa816
* https://github.com/jonatas/fast
* http://www.zenspider.com/projects/ruby2ruby.html
* [Parsing Ruby](https://whitequark.org/blog/2012/10/02/parsing-ruby/)
* [awesome-ruby-ast](https://github.com/rajasegar/awesome-ruby-ast)

Inspired by [AST Explorer](https://astexplorer.net) by [Felix Kling](https://github.com/fkling)

## Tools
* [parser gem](https://github.com/whitequark/parser)
* [CodeMirror](https://codemirror.net/)

## Other related tools
* [Astrolabe](https://github.com/yujinakayama/astrolabe)
