# frozen_string_literal: true

require 'parser/current'
require 'json'

# AST Controller
class AstController < ApplicationController
  def index
    @ast = Parser::CurrentRuby.parse('2 + 2')
    p @ast
    respond_to do |format|
      format.json { render json: { ast: @ast } }
    end
  end

  def create
    @source_code = params[:code]
    @transform = params[:transform]

    ast = Parser::CurrentRuby.parse(params[:code])

    # Doing eval is not that safe, need to sanitize
    eval(params[:transform])

    buffer        = Parser::Source::Buffer.new('(example)')
    buffer.source = params[:code]
    # begin
      temp = Parser::CurrentRuby.parse(params[:code])
      rewriter = Transform.new

      # Rewrite the AST, returns a String with the new form.
      output = rewriter.rewrite(buffer, temp)
    # rescue StandardError
      # output = params[:code]
    # end

    respond_to do |format|
      format.json { render json: { ast: ast.to_s, output: output.to_s, treeData: ast.to_json } }
    end
  end
end
