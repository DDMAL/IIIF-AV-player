function createUI ()
{
    let main = $('<main>', {'class': 'main'});

    // search manifest box
    let searchBox = $('<form>');
    let input = $('<input>', {'type': 'search', 'placeholder': 'Search', 'id': 'urlBox'});
    let button = $('<button>', {'type': 'button', 'id': 'getURL'});
    button.text('Get Manifest');
    searchBox.append(input, button);
    main.append(searchBox);

    // player controls
    let playerControls = $('<div>', {'class': 'player_controls', 'id': 'player_controls', 'style': 'text-align:center; padding-bottom: 10px'}).hide();
    let back = $('<button>', {'type': 'button', 'id': 'button_bw', 'onclick': 'backButtonPress()'});
    let play = $('<button>', {'type': 'button', 'id': 'button_play', 'onclick': 'playButtonPress()'});
    let stop = $('<button>', {'type': 'button', 'id': 'button_stop', 'onclick': 'stopButtonPress()'});
    let forward = $('<button>', {'type': 'button', 'id': 'button_fw', 'onclick': 'forwardButtonPress()'});
    let pageBack = $('<button>', {'class': 'page_back', 'onclick': 'pagePrev()'});
    let pageNext = $('<button>', {'class': 'page_next', 'onclick': 'pageNext()'});
    back.text('<');
    play.text('Play/Pause');
    stop.text('Stop');
    forward.text('>');
    pageBack.text('[');
    pageNext.text(']');
    playerControls.append(back, play, stop, forward, pageBack, pageNext);
    main.append(playerControls);
    // player
    let player = $('<div>', {'class': 'playerContainer', 'style': 'float:left; width:50%;'});
    main.append(player);

    // score
    let score = $('<div>', {'class': 'score', 'style': 'float:right; width:50%'});
    main.append(score);

    $('body').append(main);
}
createUI();