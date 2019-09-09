class SessionsController < ApplicationController
  def create     
    auth = request.env["omniauth.auth"]     
    #pp auth
    session[:user_id] = auth["uid"]     
    session[:github_token] = auth.credentials.token
    redirect_to root_url, :notice => "Signed in!"
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_url, :notice => "Signed out!"
  end
end
