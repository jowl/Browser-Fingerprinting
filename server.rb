require 'rubygems'
require 'sinatra'
require 'pp'
require 'json'
require 'mongo'
require 'active_support/all'
require 'sinatra/base'
require 'json-schema'
require 'rack/accept'
require './lang.rb'
require 'net/http'

class Server < Sinatra::Base

  use Rack::Accept

  # Get index.htm
  get %r{/(en|sv)?$} do |lang|
    @fingerprint = {}
    cookie_value = request.cookies['fingerprint']
    cookie_value ||= random_uid
    @fingerprint['uid'] = cookie_value
    @fingerprint['ip'] = request.ip

    @fingerprint['useragent'] = {}
    begin
      agentString = URI.escape(request.user_agent)
      uri = '/?uas=' + agentString + '&getJSON=all'
      res = Net::HTTP.get_response('www.useragentstring.com',uri)
      res.value
      @fingerprint['useragent'] = JSON.parse(res.body)
    rescue
    ensure
      @fingerprint['useragent']['description'] = request.user_agent
    end
    accept = env['rack-accept.request']

    @fingerprint['accept_language'] = []
    for language in accept.language.values
      @fingerprint['accept_language'].push({'name' => language,'qvalue' => accept.language.qvalue(language)})
    end 

    @fingerprint['accept_charset'] = []
    for charset in accept.charset.values
      @fingerprint['accept_charset'].push({'name' => charset,'qvalue' => accept.charset.qvalue(charset)})
    end 

    @fingerprint['accept_encoding'] = []
    for enc in accept.encoding.values
      @fingerprint['accept_encoding'].push({'name' => enc,'qvalue' => accept.encoding.qvalue(enc)})
    end 

    @fingerprint['accept_mediatype'] = []
    for typ in accept.media_type.values
      @fingerprint['accept_mediatype'].push({'name' => typ,'qvalue' => accept.media_type.qvalue(typ)})
    end 

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
    
      # Set new cookie w/ uid
      response.set_cookie('fingerprint',{ :value => fingerprint['uid'],:expires => 3.months.from_now})
        
      # Insert fingerprint to DB
      db = Mongo::Connection.new.db('fingerprints')
      collection = db.collection('fingerprints')
      collection.insert(fingerprint)
      
      response.finish
    end
    
  end

  # Get dataset
  get %r{/dataset(.json)?} do |json|
    if json
      db = Mongo::Connection.new.db('fingerprints')
      collection = db.collection('fingerprints')
      
      response.body = collection.find().to_a.map { |f| 
        { 'useragent_name' => f['useragent']['agent_name'],
          'useragent_version' => f['useragent']['agent_version'],
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
