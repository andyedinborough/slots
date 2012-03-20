(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var Slots = (function(){ 
  var _entries, _prizes, bar = $('.bar'), stopped = false, 
    slots = $('.slot'),
    winners = localStorage.winners ? JSON.parse(localStorage.winners)  : [],
    Slots, uid = 0, events = $({}),
    bezier = $.bez([.42,.43,.7,1.39]);
    
  $.extend(winners, {
    save: function(){
      localStorage.winners = JSON.stringify(this);    
    },
    clear: function(){
      this.length = 0;
      this.save();
    },
    add: function(){
      this.push.apply(this, arguments);
      this.save();
    },
    report: function(){
      return this.map(function(winner){
        return winner.text + ' won ' + winner.prize;
      }).join('\n');
    }
  }); 
  
  $.fn.randomizeChildren = function() {
    return this
      .children()
      .sort(function(a, b) {
        return Math.random() - 0.5;
      })
      .appendTo(this)
      .end().end();
  };
  
  function init(entries, prizes){
    _entries = Slots.entries = entries.map(function(entry, i){
      return $.extend(
        $.type(entry) === 'string' ? { text: entry, id: i } : entry,
        { uid: uid++ }
      );
    });
    _prizes = prizes || [];
      
    slots.each(function(){
      var slot = $(this).empty(),
        spin = $('<div class="spin"/>');
      
      _entries.forEach(function(entry){ 
        $('<div class="entry"/>')
          .html(entry.image ? $('<img />').attr('src', entry.image) : entry.text)
          .addClass(entry.image ? 'image' : 'text')
          .attr('data-uid', entry.uid)
          .appendTo(spin);
      });
      
      spin
        .randomizeChildren()
        .appendTo(slot)
        .clone().appendTo(slot)
        .clone().appendTo(slot); 
    }); 
    
    winners.forEach(function(winner){
      events.trigger('winner', [winner]);
    });
    if(winners.length === Math.min(_entries.length, _prizes.length)){
      events.trigger('finished');          
      Slots.finished = true;
    }
  } 
 
  function stop(){
    Slots.stopped = true;
    var slots = $('.slot'),
      entries = $('.entry'),
      winner;
      
    for(var i = 0; i<_entries.length; i++){
      winner = _entries[Math.floor(_entries.length*Math.random())];
      if(!winners.some(function(prev){
        return prev.uid === winner.uid;
      })) break;
      winner = null;
    } 
    
    if(winner === null) 
      return alert('All entries have been drawn!');
      
    winner = $.extend({ 
      prize: _prizes[winners.length] || ''
    }, winner); 
    
    winners.add(winner);
    slots.find('.spin:nth-child(2) [data-uid=' + winner.uid + ']').addClass('winner');
    entries.not('.winner').addClass('loser');  
    slots.each(function(i){
      $(this).data('info').state = 1;
    });
  }
  
  
  function onFrame (func) {
    var ref = {};
    ref.id = window.requestAnimationFrame(function again(){
      if(func() !== false){
        ref.id = window.requestAnimationFrame(again);
      }
    });
    return ref;
  }
  
  function cancelFrame(ref){
    if(ref) 
      window.cancelAnimationFrame(ref.id);
  }
  
  function px(n) {
    return ((n + 0.5) << 0) + 'px';
  }
  
  onFrame(function (){
    $('.slot').each(function (){
      var slot = $(this), 
        spin = slot.children('.slot:first'),
        info = slot[0].info || (slot[0].info = { state: 2, speed: slot.data('speed') / 1000 }),
        speed = info.speed,
        height = spin.height(),
        endpoint = info.endpoint,
        current = info.current || 0,
        state = info.state,
        y = 0; 
      current += Math.abs(speed);
     
      if(current >= 1) {
        if(state === 2) {
          return;
        }
        current = 0; 
        var winner = slot.find('.winner'); 
        endpoint = height;      
        if(state === 1){
          this.style.marginTop = px(-height); 
          var mid =  winner.position().top + winner.height() / 2; 
          endpoint = -winner.position().top - winner.height() / 2 + slot.height() / 2; 
          info.state = state = 2;
        }
        info.endpoint = endpoint;  
      }  
      
      if(false && state === 2){  
        y = bezier(current);
      } else y = current;
      
      if(speed < 0) y = 1 - y;
      
      this.style.marginTop = px(y * endpoint - height);   
      info.current = current;   
    });
  });
    
  function start(){
    Slots.stopped = false;
    $('.entry').removeClass('winner loser');
    $('.slot')
      .removeClass('stopped')
      .each(function(i){
        this.info.state = 0;
      });
    
    events.trigger('start', [_prizes[winners.length] || '']);
  }
  
  return Slots = { init: init, start: start, stop: stop, winners: winners, stopped: false, events: events };
})();

