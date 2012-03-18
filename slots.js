var Slots = (function(){ 
  var _entries, bar = $('.bar'), stopped = false, 
    slots = $('.slot'),
    winners = localStorage.winners ? JSON.parse(localStorage.winners)  : [],
    Slots;
    
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
    }
  }); 
  
  function init(entries){
    _entries = entries;
      
    slots.each(function(){
      var slot = $(this).empty(),
        spin = $('<div class="spin"/>').appendTo(slot);
      
      _entries.forEach(function(entry){ 
        $('<div class="entry"/>')
          .html(entry || entry.text || $('<img />').attr('src', entry.image))
          .addClass(entry.image ? 'image' : 'text')
          .appendTo(spin);
      });
      
      spin.clone().appendTo(slot); 
      spin.clone().appendTo(slot); 
    }); 
  }
 
  function stop(){
    Slots.stopped = true;
    var winnerName = _entries[Math.floor(_entries.length*Math.random())],
      slots = $('.slot'),
      entries = $('.entry'),
      winners = entries.filter(function(){ return $(this).text() === winnerName; }).addClass('winner'),
      losers = entries.not('.winner').addClass('loser');  
    slots.each(function(i){
      $(this).data('rem', i === 0 ? 1 : i === 1 ? 3 : 2);
    });
  }
    
  function start(){
    Slots.stopped = false;
    $('.entry').removeClass('winner loser').css({
      opacity: '',
      color: ''
    });
    
    $('.slot .spin:first-child').each(function animate(){
      var spin = $(this), slot = spin.parent(),
        speed = slot.data('speed'),
        height = spin.height(),
          winner = slot.find('.winner').eq(1),
        hasWinner = !!winner[0] && slot.data('rem', (slot.data('rem') || 0) - 1).data('rem') <= 0,
        after  = hasWinner ? $.noop : animate,
        easing = hasWinner ? 'linear' : 'linear',
        winnerTop = hasWinner ? (winner.position().top - slot.height() /2 + winner.height()/2) : 0;    
      
     console.log(winner[0], slot.data('rem'));
      spin.css({ marginTop: speed > 0 ? -height : 0 });
      var marginTop = winner[0] ? 
        (speed > 0 ? -winnerTop : (-height-winnerTop)): 
        (speed > 0 ? 0 : -height);
      speed = hasWinner ? Math.abs(marginTop / height) * speed : speed;
      spin.animate({
           marginTop: marginTop
      }, Math.abs(speed), 'linear', after);
    });
  }
  
  return Slots = { init: init, start: start, stop: stop, winners: winners, stopped: false };
})();

Slots.init([
    'Andy Edinborough',
    'David Gosse',
    'Jennifer Gosse',
    'Evan Nagle',
    'Mike Manzano',
    'Jason Lovelady'
  ]);
  
$(window).load(function(){
  Slots.start();
});

$(document).keyup(function(e){
  if(e.keyCode===32){
    return Slots.stopped ? Slots.start() : Slots.stop();
  }
});

var star = $('.star');
for(var i = 1; i<36; i++)
  star.wrap(star.clone());
