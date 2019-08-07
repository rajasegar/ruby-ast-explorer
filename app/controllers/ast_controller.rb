require 'parser/current'
class RemoveDo < Parser::TreeRewriter
  def on_while(node)
    # Check if the statement starts with "do"
    if node.location.begin.is?('do')
      remove(node.location.begin)
    end
  end
end

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

    code = <<-EOF
                      while true do
                         puts 'hello'
                         end
    EOF

    buffer        = Parser::Source::Buffer.new('(example)')
    buffer.source = params[:code]
    temp = Parser::CurrentRuby.parse(params[:code])
    rewriter      = RemoveDo.new

    # Rewrite the AST, returns a String with the new form.
    output =  rewriter.rewrite(buffer, temp)
    puts output


    respond_to do |format|
      format.json { render :json => { ast: @ast.to_s, output: output.to_s } } 
    end

  end
end
