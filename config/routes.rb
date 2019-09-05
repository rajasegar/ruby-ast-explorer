Rails.application.routes.draw do
  get 'gist/show'
  get 'ast/index'
  resources :ast
  resources :gist
  get 'welcome/index'
  post 'ast/gist' => 'ast#gist'
  get "/auth/github/callback" => "sessions#create"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'welcome#index'
end
