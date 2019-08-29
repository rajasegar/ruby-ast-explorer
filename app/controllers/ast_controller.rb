require 'parser/current'
require 'json'

class AstController < ApplicationController

  def initialize
    @node_id = 0
  end

  def fetch_node_id(node)
    case node
    when Integer, NilClass, String, Symbol
      (@node_id += 1).to_s
    else
      node.object_id.to_s
    end
  end


  def traverse(root, node)
    node.children.each do |child|
      #p child.to_json
      label = case child
              when Integer; child
              when NilClass; 'nil'
              when String; "\"#{child}\""
              when Symbol; ":#{child}"
              else
                child.type.to_s
              end
      #p "|-#{label}: #{fetch_node_id(child)}"
      #@indent += 1
      #
      location = child.loc.to_hash[:expression] if child.respond_to? :loc 
    start = location.begin.begin_pos if location.respond_to? :begin
    loc_end = location.end.end_pos if location.respond_to? :end

    obj = {
      :label => label,
      :start => start,
      :end => loc_end
    }


      root[fetch_node_id(child)] = obj

      traverse(root[fetch_node_id(child)],child) if child.respond_to? :children
    end 
  end


  def index
    @ast = Parser::CurrentRuby.parse("2 + 2")
    p @ast
    respond_to do |format|
      format.json { render :json => { ast: @ast } } 
    end
  end

  def create
    ast = Parser::CurrentRuby.parse(params[:code])

    pp ast


    myjson = {}

    traverse(myjson, ast)
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
