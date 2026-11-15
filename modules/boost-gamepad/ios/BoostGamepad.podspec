Pod::Spec.new do |s|
  s.name           = 'BoostGamepad'
  s.version        = '1.0.0'
  s.summary        = 'Bridges Apple GameController (MFi, Stadia, PS, Xbox) to JS'
  s.author         = ''
  s.homepage       = 'https://github.com/simonflore/lego-boost-app'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.frameworks     = 'GameController'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files   = '**/*.{h,m,swift}'
end
