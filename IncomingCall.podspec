require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "IncomingCall"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/t-kiattisak/react-native-incoming-call.git", :tag => "#{s.version}" }

  s.source_files = [
    "ios/*.{swift,h,m,mm}",
    "ios/**/*.{swift,h,m,mm}",
    "cpp/**/*.{hpp,cpp}",
  ]

  s.dependency 'React-Core'
  s.dependency 'React-callinvoker'

  load 'nitrogen/generated/ios/IncomingCall+autolinking.rb'
  add_nitrogen_files(s)

  s.public_header_files = Array(s.attributes_hash['public_header_files']) + [
    'ios/IncomingCallEventEmitter.h',
  ]

  install_modules_dependencies(s)
end
