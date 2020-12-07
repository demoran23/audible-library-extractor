
import ajaxios from './_misc/ajaxios.js';
export default {
  mixins: [ajaxios],
  methods: {
    getDataFromStorePages: function( books, done ) {
      
      this.progress.text = 'Fetching additional data from store pages...';
      this.progress.bar  = true;
      this.progress.step = 0;
      
      const vue = this;
      const requests = prepStorePages( this, books );
      console.log('%c' + 'requests' + '', 'background: #c71485; color: #fff; padding: 2px 5px; border-radius: 8px;', requests);
      if ( requests ) {
        this.ajaxios({
          request: requests,
          step: function( response, bookIndex ) {
          
            let book = books[ bookIndex ];
            vue.progress.text2 = book.title;
            
            if ( response.status >= 400 ) {
              book.storePageMissing = true;
              // vue.library.storePageMissing.push( book );
            }
            else {
              getStorePageData( vue, response, book );
            }
            
            ++vue.progress.step; 
            console.log('%c' + 'book' + '', 'background: #dbff00; color: #000; padding: 2px 5px; border-radius: 8px;',book);
            return book;
            
          },
          flatten: true,
          done: function( books ) {
            
            console.log('%c' + 'store RESPONSES' + '', 'background: #7d0091; color: #fff; padding: 2px 5px; border-radius: 8px;', books);
            vue.progress.text2 = '';
            vue.progress.step = -1;
            vue.progress.maxLength = 0;
            vue.progress.bar = false;
            
            // setTimeout( function() {
              done(null, books);
            // }, 1000);
            
          }
        });
      }
      else {
        console.log('%c' + 'Error: No store pages' + '', 'background: #f41b1b; color: #fff; padding: 2px 5px; border-radius: 8px;');
      }
      
    },
    
  },
};

function prepStorePages( vue, books ) {
  
  let source = vue.partialScan ? _.filter(books, 'new') : books;
  
  if ( source.length > 0 ) return _.map( source, function( o ) {
    console.log( o.title, o )
    return window.location.origin + '/pd?asin=' + o.asin;
  });
  else return null;
  
}

function getStorePageData( vue, response, book ) {
  
  var   html     = $($.parseHTML(response.data));
  const audible  = html.find('div.adbl-main')[0];
  const jsonData = JSON.parse( html.find('#bottom-0 > script:first')[0].textContent );
  const bookData = jsonData[0];
  html =  null;
          
  response.data = null;
  // When the store page is replaced with a new version, its ID (asin) may change and so here
  // I just make a note of it so that we can say in the gallery that  the information here may 
  // be inaccurate
  if ( !book.test ) {
    const storePageChanged = response.request.responseURL.lastIndexOf(book.asin) < 0;
    if ( storePageChanged ) book.storePageChanged = true;
  }

  // This "#sample-player..." selector tries to weed out missing store pages
  if ( book.test || audible.querySelector('#sample-player-'+ book.asin +'> button') ) { 
    book.titleShort  = bookData.name;
    book.ratings     = parseFloat( audible.querySelector('.ratingsLabel > a').textContent.match(/\d/g).join('') );
    book.rating      = Number( audible.querySelector('.ratingsLabel > span:last-of-type').textContent.trimAll() );
    book.summary     = bookData.description || vue.getSummary( audible.querySelector('.productPublisherSummary > .bc-section > .bc-box:first-of-type') || audible.querySelector('#center-1 > div.bc-container > div > div.bc-col-responsive.bc-col-6 > span') );
    book.releaseDate = bookData.datePublished || vue.fixDates( audible.querySelector('.releaseDateLabel') );
    book.publishers  = vue.getArray( audible.querySelectorAll('.publisherLabel > a') );
    book.length      = book.length || vue.shortenLength( audible.querySelector('.runtimeLabel').textContent.trimToColon() );
    book.categories  = vue.getArray(audible.querySelector('.categoriesLabel') ? audible.querySelectorAll('.categoriesLabel > a') : audible.querySelectorAll('.bc-breadcrumb > a') );
    book.sample      = book.test ? null : audible.querySelector('#sample-player-'+ book.asin +' > button').getAttribute('data-mp3');
    book.language    = bookData.inLanguage ? _.startCase( bookData.inLanguage ) : audible.querySelector('.languageLabel').textContent.trimToColon();
    book.format      = audible.querySelector('.format').textContent.trimAll();
    // Around July 2020 audible has removed any mention of the added date. 
    // It was early 2020 when it was removed from the library page and now it's totally gone aside from the purchase history.
    // book.dateAdded   = vue.fixDates( audible.querySelector('#adbl-buy-box-purchase-date > span') );
    
    vue.carouselDataFetch(book, audible, 'peopleAlsoBought', 5 );
    vue.carouselDataFetch(book, audible, 'moreLikeThis', 6 ); 
    // Audible seemed to have stopped using the ↑↑↑ "more like this" carousel in store pages around 2020 march-april.
    book = _.omitBy( book, _.isNull );
  }
  else { 
    book.storePageMissing = true;
  }
  
  
}