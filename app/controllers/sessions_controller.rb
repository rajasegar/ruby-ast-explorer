class SessionsController < ApplicationController
  def create     
    auth = request.env["omniauth.auth"]     
    p auth
    #user = User.find_by_provider_and_uid(auth["provider"], auth["uid"]) || User.create_with_omniauth(auth)     
    #session[:user_id] = user.id     
    
    session[:user_id] = auth["uid"]     
    session[:github_token] = params[:code]
    redirect_to root_url, :notice => "Signed in!"
  end

  def destroy
    session[:user_id] = nil
    redirect_to root_url, :notice => "Signed out!"
  end
end
