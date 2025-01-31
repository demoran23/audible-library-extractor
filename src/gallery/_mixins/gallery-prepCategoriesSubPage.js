import slugify from "./gallery-slugify.js";
export default {
  mixins: [slugify],
  methods: {
    prepCategoriesSubPage: function(book) {
      if (this.$route.name === "category") {
        
        const vue = this;
        const category = {
          parent: this.$route.params.parent,
          child: this.$route.params.child,
          book: this.$route.params.query
        };
        
        let categoryBooks = _.filter( this.subPageSource.collection, function( book ) {
          if ( book.categories ) {
            const cat = book.categories[0] ? vue.slugify( book.categories[0].name ) : false;
            const kitten = book.categories[1] ? vue.slugify( book.categories[1].name ) : false;
            if ( cat && kitten && (category.parent === cat && category.child === kitten) ) {  return true; }
            else if ( cat && (category.parent === cat && !category.child) ) { return true; }
          }
        });
        
        // Set page title
        if ( categoryBooks && (category.parent || category.child)  ) {
          const parentCategoryName = categoryBooks[0].categories[0] ? categoryBooks[0].categories[0].name : null;
          const childCategoryName = categoryBooks[0].categories[1] ? categoryBooks[0].categories[1].name : null;
          if ( parentCategoryName ) this.pageTitle = parentCategoryName;
          if ( childCategoryName && category.child ) this.pageSubTitle = childCategoryName;
        }
        
        // Just thinking about things... 
        // this.getTags( categoryBooks );

        // Init arrays
        this.$store.commit("prop", { key: 'pageCollection', value: categoryBooks });
        this.collectionSource = 'pageCollection';
        
      }
    },
    // getTags: function( books ) {
      
    //   let allTags = _.filter( books, 'tags');
    //   allTags = _.map( allTags, 'tags');
    //   allTags = _.flatten( allTags );
    //   if (_.isEmpty( allTags ) ) allTags = null;
    //   else { allTags = _.union(allTags); }
      
    //   console.log( allTags )
      
    // },
  }
};
