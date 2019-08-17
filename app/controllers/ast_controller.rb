require 'parser/current'

class AstController < ApplicationController
  def index
    @ast = Parser::CurrentRuby.parse("2 + 2")
    p @ast
    respond_to do |format|
      format.json { render :json => { ast: @ast } } 
    end
  end

  def create
    p params
    ast = Parser::CurrentRuby.parse(params[:code])

    # Doing eval is not that safe, need to sanitize
    eval(params[:transform])
    pp ast


    buffer        = Parser::Source::Buffer.new('(example)')
    buffer.source = params[:code]
    temp = Parser::CurrentRuby.parse(params[:code])
    rewriter      = Transform.new


    # Rewrite the AST, returns a String with the new form.
    output =  rewriter.rewrite(buffer, temp)
    puts output


    respond_to do |format|
      format.json { render :json => { ast: ast.to_s, output: output.to_s } } 
    end

  end
end
