# config/initializers/omniauth.rb
Rails.application.config.middleware.use OmniAuth::Builder do
  #provider :github, ENV['GITHUB_KEY'], ENV['GITHUB_SECRET'], scope: "user:email,user:follow,gist"
  provider :github, "79ad14545cc1877b4ed8", "7e8de7e18eb6722c5bc9673b69b4cf7dfb5d6e86", scope: "user:email,user:follow,gist"
end
