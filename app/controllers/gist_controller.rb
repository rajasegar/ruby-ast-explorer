class GistController < ApplicationController

  def ast_explorer_gist?(files)
    if files
      files.has_key?("transform.rb") and files.has_key?("source.rb")
    else
      false
    end
  end

  def index
    response = Gist.list_all_gists("",{ :access_token => session[:github_token]})
    @gists = JSON.parse(response.body).select { |gist| ast_explorer_gist?(gist['files']) }
  end

  def show
    gist_id = params[:id]

    # Also need to check if he is the owner of the gist 
    if session[:user_id]
    session[:gist_id] = gist_id
    end
    @transform = Gist.read_gist( gist_id, 'transform.rb', { :access_token => session[:github_token]})
    @source_code = Gist.read_gist( gist_id, 'source.rb', { :access_token => session[:github_token]})
  end


  def create
    source = params[:code]
    transform = params[:transform]
    yml = "v:1\nparser:2.6.3.0\nrails:5.2.3\nruby:2.5.5p157"
    response = Gist.multi_gist({"source.rb" => source, "transform.rb" => transform, "ruby-ast-explorer.yml" => yml}, 
                    :public => true, 
                    :description => "A Gist generated by ruby-ast-explorer",
                    :access_token => session[:github_token])
    session[:gist_id] = response['id']
    respond_to do |format|
      format.json { render :json => { message: "Exported to gist with name = ruby-ast-explorer.yml successfully.", gist: response['id'] } } 
    end
  end

  def update
    source = params[:code]
    transform = params[:transform]
    response = Gist.multi_gist({"source.rb" => source, "transform.rb" => transform }, 
                    :access_token => session[:github_token],
                    :update => params[:id])
    respond_to do |format|
      format.json { render :json => { message: "Updated gist with name = ruby-ast-explorer.yml successfully.", gist: response['id'] } } 
    end
  end

end
