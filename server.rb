require 'rubygems'
require 'sinatra'
require 'pp'
require 'json'
require 'mongo'
require 'active_support/all'
require 'sinatra/base'

class Server < Sinatra::Base

# Get index.htm
get %r{/(en|sv)?$} do |lang|
  if lang == 'sv'
    File.read(File.join('public', 'index_sv.htm'))
  else
    File.read(File.join('public', 'index.htm'))
  end
end

# Post fingerprint
post '/post' do 

  # TODO: 
  # - validation of POST data 
  # - protection against CSRF
  # - post more info to client, e.g. how many fingerprints etc. ?

  # Read and parse post data
  fingerprint = JSON.parse request.body.read.to_s

  # Get and set cookie w/ uid
  cookie_value = request.cookies['fingerprint']
  cookie_value ||= random_uid
  response.set_cookie('fingerprint',{ :value => cookie_value,:expires => 3.months.from_now})
  fingerprint['uid'] = cookie_value

  # Get info from request
  fingerprint['ip'] = request.ip
  fingerprint['accepts'] = request.accept

  # Insert fingerprint to DB
  db = Mongo::Connection.new.db('fingerprints')
  collection = db.collection('fingerprints')
  collection.insert(fingerprint)

  # Respond to client
  response.body = ['Thank you for your data, please come back again in a day or two.']
  response.finish

end

# Generate random UID /[a-z0-9]{12}/
def random_uid()
  return (1..12).reduce('') { |uid,_| uid + (rand 36).to_s(36) }
end

end
