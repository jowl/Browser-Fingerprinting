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

    @fingerprint['accept'] = {}

    @fingerprint['accept']['language'] = []
    for language in accept.language.values
      @fingerprint['accept']['language'].push({'name' => language,'qvalue' => accept.language.qvalue(language)})
    end 

    @fingerprint['accept']['charset'] = []
    for charset in accept.charset.values
      @fingerprint['accept']['charset'].push({'name' => charset,'qvalue' => accept.charset.qvalue(charset)})
    end 

    @fingerprint['accept']['encoding'] = []
    for enc in accept.encoding.values
      @fingerprint['accept']['encoding'].push({'name' => enc,'qvalue' => accept.encoding.qvalue(enc)})
    end 

    @fingerprint['accept']['media_type'] = []
    for typ in accept.media_type.values
      @fingerprint['accept']['media_type'].push({'name' => typ,'qvalue' => accept.media_type.qvalue(typ)})
    end 

    @language = lang
    @translations = Lang.getLang(lang)
    erb :index_test
  end
  
  # Post fingerprint
  post '/post' do 
    
    # TODO: 
    # - post more info to client, e.g. how many fingerprints etc. ?
    # - need to have cookie?
    
    # Read and parse post data
    fingerprint = JSON.parse request.body.read

#    if JSON::Validator.validate!('schema.json',fingerprint.to_json)
    
    # Set new cookie w/ uid
    response.set_cookie('fingerprint',{ :value => fingerprint['uid'],:expires => 3.months.from_now})
    
    # Insert fingerprint to DB
    db = Mongo::Connection.new.db('fingerprints')
    collection = db.collection('fingerprints')
    collection.insert(fingerprint)
    
    response.finish
#    end
    
  end

  # Get dataset
  get %r{/dataset(\.json)?} do |json|
    if json
      db = Mongo::Connection.new.db('fingerprints')
      collection = db.collection('fingerprints')
      
      fields = params.keys.reject { |x| x == 'captures' }

      response.body = collection.find({}, { :fields => fields, :sort => 'uid'}).to_json
          
      response.finish
    else
      File.read(File.join('public', 'dataset.htm'))
    end

  end

  get '/time' do
    cache_control :no_cache
    response.body = [(Time.now.to_f*1000).round.to_s]
    response.finish
  end

  get '/count' do
    cache_control :no_cache
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
