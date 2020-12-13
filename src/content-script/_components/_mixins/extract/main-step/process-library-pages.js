
export default {
  methods: {
    getDataFromLibraryPages: function( hotpotato, libraryPagesFetched, ) {
      
      const vue = this;
      
      this.$root.$emit('update-big-step', {
        title: 'Library',
        stepAdd: 1,
      });
      
      this.$root.$emit('update-progress', {
        step: 0,
        max: 0,
        text: vue.partialScan ? 
          'Updating old books (' + vue.localStorageBooksLength + ') and adding new books...' :
          'Scanning library for books...',
      });
      
      vue.scrapingPrep( vue.libraryUrl, function( prep ) { 
        
        const requestURL = prep.urlObj.toString();
        vue.amapxios({
          requests: _.map(prep.pageNumbers, function( page ) { return requestURL + '&page=' + page }),
          step: function( response, stepCallback ) {
            processLibraryPage( vue, response, stepCallback );
          },
          flatten: true,
          done: function( books ) {
            
            hotpotato.books = books;
            libraryPagesFetched(null, hotpotato);
            
          }
        });
        
      });
      
      
    },
    
  },
};

function processLibraryPage( vue, response, stepCallback ) {
  
  const audible = $($.parseHTML(response.data)).find('div.adbl-main')[0];
  response.data = null;
  
  const books    = [];
  
  const titleRows = audible.querySelectorAll('#adbl-library-content-main > .adbl-library-content-row');
  $(titleRows).each(function () {
    
    const _thisRow = this;
    const rowItemIsBook = _thisRow.querySelector('[name="contentType"][value="Product"]') || _thisRow.querySelector('[name="contentType"][value="Performance"]');
    // Ignore anything that isn't a book, like for example podcasts...
    if ( rowItemIsBook ) {
      const bookASIN        = _thisRow.getAttribute('id').replace('adbl-library-content-row-', '');
      const bookInMemory    = _.find(vue.library.books, ['asin', bookASIN]);
      const fullScan_ALL_partialScan_NEW = vue.partialScan && !bookInMemory || !vue.partialScan;
      let book            = (vue.partialScan && bookInMemory) ? bookInMemory : {};
      
      // UPDATE SCAN: fetch these only if the book is a new addition...
      // FULL SCAN: fetch always
      if ( fullScan_ALL_partialScan_NEW ) {
        book.asin       = bookASIN;
        const getCover  =  _thisRow.querySelector('a > img.bc-pub-block:first-of-type').getAttribute('src');
        // FIXME: there is probably a better way to do this:
        if ( getCover.lastIndexOf('img-coverart-prod-unavailable') > -1 ) {
          // book.cover = getCover;
        }
        else {
          const coverId = getCover.match(/\/images\/I\/(.*)._SL/);
          if ( coverId && coverId[1] ) book.cover = coverId[1];
        }
        // book.url        = _thisRow.querySelector(':scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a').getAttribute('href').split('?')[0];
        book.title      = _thisRow.querySelector(':scope > div.bc-row-responsive > div.bc-col-responsive.bc-col-10 > div > div.bc-col-responsive.bc-col-9 > span > ul > li:nth-child(1) > a > span').textContent.trimAll();
        book.authors    = vue.getArray(_thisRow.querySelectorAll('.authorLabel > span > a'));
        book.narrators  = vue.getArray(_thisRow.querySelectorAll('.narratorLabel > span > a'));
        book.series     = vue.getSeries(_thisRow.querySelector('.seriesLabel'));
        book.blurb      = _thisRow.querySelector('.summaryLabel > span').textContent.trimAll();
        const fromPlusCatalog = _thisRow.querySelector('input[value="AudibleDiscovery"]');
        if ( fromPlusCatalog ) book.fromPlusCatalog = true;
      }
      
      // ALWAYS FETCH ↓↓ ( downloaded, favorite, progress, myRating )
      
      // Came from the plus catalog but is no longer available there.
      const unavailableBtn = _thisRow.querySelector('.adbl-library-inaccessible-button');
      if ( unavailableBtn ) book.leftPlusCatalog = true;
      
      // Downloaded
      book.downloaded = _thisRow.querySelector('.adbl-library-action > div:nth-child(4) > span') ? true : null;
      
      // Favorite
      const favorite = _thisRow.querySelector('[id^="remove-from-favorites-button"]:not(.bc-pub-hidden)');
      if ( favorite ) book.favorite = true;
      
      // Progress
      const progressbar = _thisRow.querySelector('[id^="time-remaining-display"] [role="progressbar"]');
      const finished = _thisRow.querySelector('[id^="time-remaining-finished"]:not(.bc-pub-hidden)') ? true : false;
      const timeRemaining = _thisRow.querySelector('[id^="time-remaining"]:not(.bc-pub-hidden)').textContent.trimAll();
      if (progressbar || finished) {
        book.progress = timeRemaining;
      }
      else {
        book.length   = timeRemaining;
        book.progress = 0;
      }
      
      // Own rating
      const myRating = _thisRow.querySelector('div.bc-rating-stars.adbl-prod-rate-review-bar.adbl-prod-rate-review-bar-overall').getAttribute('data-star-count');
      if ( myRating > 0 ) book.myRating = myRating;
      
      book = _.omitBy( book, _.isNull );
      
      // - - - - - - - 
      
      if ( vue.partialScan && !bookInMemory ) book.new = true;
      if ( fullScan_ALL_partialScan_NEW ) vue.$root.$emit('update-progress-max');
      books.push(book);
      
    }
    
  });
      
  stepCallback( books );
  
}
