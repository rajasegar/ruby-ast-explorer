require 'parser/current'
require 'json'

class AstController < ApplicationController

  def index
    @ast = Parser::CurrentRuby.parse("2 + 2")
    p @ast
    respond_to do |format|
      format.json { render :json => { ast: @ast } } 
    end
  end

  def create
    ast = Parser::CurrentRuby.parse(params[:code])

    pp ast.to_json

    # Doing eval is not that safe, need to sanitize
    eval(params[:transform])


    buffer        = Parser::Source::Buffer.new('(example)')
    buffer.source = params[:code]
    temp = Parser::CurrentRuby.parse(params[:code])
    rewriter      = Transform.new

    # Rewrite the AST, returns a String with the new form.
    output =  rewriter.rewrite(buffer, temp)


    respond_to do |format|
      format.json { render :json => { ast: ast.to_s, output: output.to_s, treeData: ast.to_json } } 
    end

  end

  def gist
    source = params[:code]
    transform = params[:transform]
    yml = "v:1\nparser:2.6.3.0\nrails:5.2.3\nruby:2.5.5p157"
    p session[:github_token]
    Gist.gist("Hello world from ruby-ast-explorer", :access_token => session[:github_token])
    respond_to do |format|
      format.json { render :json => { message: "Success" } } 
    end
  end
end
