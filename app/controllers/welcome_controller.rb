class WelcomeController < ApplicationController
  def index
    if session[:user_id] == nil
      redirect_to '/auth/github'
    end
    session[:gist_id] = nil
    @transform = %{# Your Transform Class should always extend from 
# Parser:: TreeRewriter
class Transform < Parser::TreeRewriter
  def on_lvasgn(node)
    # Reverse the variable names
    replace(node.loc.name, node.children[0].to_s.reverse)
  end

  def on_def(node)
    replace(node.loc.name, node.children[0].to_s.reverse)
  end
end}

  @source_code = %q(# Paste some ruby code here and
# check the generated AST on the right
tips = [
"Click on any AST node with a '+' to expand it",

"Hovering over a node highlights the \
corresponding part in the source code",
]
def print_tips
tips.each { |key, value| print "Tip #{key}: #{value}" }
end)
  end
end
