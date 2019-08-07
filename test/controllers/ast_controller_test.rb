require 'test_helper'

class AstControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get ast_index_url
    assert_response :success
  end

end
