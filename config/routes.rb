Rails.application.routes.draw do
  get 'ast/index'
  resources :ast
  get 'welcome/index'
  post 'ast/gist' => 'ast#gist'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'welcome#index'
end
