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
    @ast = Parser::CurrentRuby.parse(params[:code])
    p @ast
    respond_to do |format|
      format.json { render :json => { ast: @ast.to_s } } 
    end

  end
end
