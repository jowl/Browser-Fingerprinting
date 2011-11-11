require 'rubygems'
require 'sinatra'
require 'pp'
require 'json'
require 'mongo'
require 'active_support/all'
require 'sinatra/base'
require 'json-schema'
require './lang.rb'

class Server < Sinatra::Base

  # Get index.htm
  get %r{/(en|sv)?$} do |lang|
    @language = lang
    @translations = Lang.getLang(lang)
    erb :index
  end
  
  
  # Post fingerprint
  post '/post' do 
    
    # TODO: 
    # - post more info to client, e.g. how many fingerprints etc. ?
    
    # Read and parse post data
    fingerprint = JSON.parse request.body.read

    if JSON::Validator.validate!('schema.json',fingerprint.to_json)
    
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
      # response.body = [@translations['thankyou_msg']]

      response.finish
    end
    
  end

  # Get dataset
  get %r{/dataset(.json)?} do |json|
    if json
      db = Mongo::Connection.new.db('fingerprints')
      collection = db.collection('fingerprints')
      
      response.body = collection.find().to_a.map { |f| 
        { 'useragent' => f['useragent'],
          'ip' => f['ip'],
          'fonts' => f['fonts'].count,
          'mime_types' => f['mime_types'].count,
          'resolution' => f['resolution']['width']*f['resolution']['height']*f['resolution']['color_depth'],
          'timezone' => f['timezone'],
          'timestamp' => f['timestamp'],
          'uid' => f['uid']
        }
      }.to_json
          
      response.finish
    else
      File.read(File.join('public', 'dataset.htm'))
    end

  end

  get '/count' do
    db = Mongo::Connection.new.db('fingerprints')
    collection = db.collection('fingerprints')
    response.body = [collection.count().to_s]
    response.finish
  end

  # Generate random UID /[a-z0-9]{12}/
  def random_uid()
    return (1..12).reduce('') { |uid,_| uid + (rand 36).to_s(36) }
  end
  
end
