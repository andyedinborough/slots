var names = [
  'Andy Edinborough',
  'David Gosse',
  'Jennifer Gosse',
  'Evan Nagle',
  'Mike Manzano',
  'Jason Lovelady'
], bar = $('.bar'), stopped = false;

var slots = $('.slot'), 
  winners = localStorage.winners ? JSON.parse(localStorage.winners)  : [];
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

slots.each(function(){
  var slot = this,
      spin = $('<div class="spin"/>').appendTo(slot);
  
  names.forEach(function(name){ 
    $('<div class="name"/>')
      .text(name)
      .appendTo(spin);
  });
  
  spin.clone().appendTo(slot); 
}); 

function stop(){
  stopped = true;
  var winnerName = names[Math.floor(names.length*Math.random())],
    slots = $('.slot'),
    entries = $('.name'),
    winners = entries.filter(function(){ return $(this).text() === winnerName; }).addClass('winner'),
    losers = entries.not('.winner').addClass('loser');  
  slots.each(function(i){
    $(this).data('rem', i === 0 ? 1 : i === 1 ? 3 : 2);
  });
}
  
function start(){
  stopped = false;
  $('.name').removeClass('winner loser').css({
    opacity: '',
    color: ''
  });
  
  $('.slot .spin:first-child').each(function animate(){
    var spin = $(this), slot = spin.parent(),
      speed = slot.data('speed'),
      height = spin.height(),
        winner = slot.find('.winner').filter(function(){ return $(this).position().top > height/3; }).eq(speed > 0 ? 0 : 1),
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

$(window).load(function(){
  start();
});
  
$(document).keyup(function(e){
  if(e.keyCode===32){
    return stopped ? start() : stop();
  }
});

var star = $('.star');
for(var i = 1; i<36; i++)
  star.wrap(star.clone());
