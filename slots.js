var Slots = (function(){ 
  var _entries, _prizes, bar = $('.bar'), stopped = false, 
    slots = $('.slot'),
    winners = localStorage.winners ? JSON.parse(localStorage.winners)  : [],
    Slots, uid = 0, events = $({});
    
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
        spin = $('<div class="spin"/>').appendTo(slot);
      
      _entries.forEach(function(entry){ 
        $('<div class="entry"/>')
          .html(entry.image ? $('<img />').attr('src', entry.image) : entry.text)
          .addClass(entry.image ? 'image' : 'text')
          .attr('data-uid', entry.uid)
          .appendTo(spin);
      });
      
      spin.clone().appendTo(slot); 
      spin.clone().appendTo(slot); 
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
      $(this).data('rem', i === 0 ? 0 : i === 1 ? 2 : 1);
    });
  }
    
  function start(){
    Slots.stopped = false;
    $('.entry').removeClass('winner loser');
    $('.slot').removeClass('stopped');
    $('.slot .spin:first-child').each(function animate(){
      var spin = $(this), slot = spin.parent(),
        speed = slot.data('speed'),
        height = spin.height(),
          winner = slot.find('.winner'),
        hasWinner = !!winner[0] && slot.data('rem', (slot.data('rem') || 0) - 1).data('rem') <= 0,
        after = hasWinner ? function() {
            $(this).closest('.slot').addClass('stopped');
            if($('.slot.stopped').length === $('.slot').length) {          
              events.trigger('winner', [winners[winners.length-1]]);    
              if(winners.length === Math.min(_entries.length, _prizes.length)){
                events.trigger('finished');                
                Slots.finished = true;
              }
            }
          } : animate,
        easing = hasWinner ? $.bez([.42,.43,.7,1.39]) : 'linear',
        winnerTop = hasWinner ? (winner.position().top - slot.height()/2 + winner.height()/2 + height) : 0;    
      
      var current = speed > 0 ? -height : 0;
      spin.css({ marginTop: current });
      var marginTop = hasWinner ? 
        -winnerTop : 
        (speed > 0 ? 0 : -height);
      speed *= hasWinner ? Math.abs((marginTop - current) / height) : 1;
      spin.animate({
           marginTop: marginTop
      }, height * Math.abs(speed) / 1000, easing, after);
    });
    
    events.trigger('start', [_prizes[winners.length] || '']);
  }
  
  return Slots = { init: init, start: start, stop: stop, winners: winners, stopped: false, events: events };
})();

