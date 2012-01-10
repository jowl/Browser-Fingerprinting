require "rubygems"
require "sinatra"

require './server.rb'

set :static_cache_control, [:public, :max_age => 3600]

run Server