import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

export default new Vuex.Store({
  
  state: {
    // States that persist by reading and writing to localStorage
    sticky: {
      lightSwitch: 1,
      lightSwitchSetByUser: false,
      // sortValues: false,
    },
    // States that don't persist
    searchCollection: [],
    mutatingCollection: [],
    collectionSource: null,
    pageCollection: null,
    route: null,
    library: null,
    urlOrigin: null,
    searchQuery: "",
    standalone: null,
    displayMode: null,
    listRenderingOpts: null,
  },

  mutations: {
    fromLocalStorage: function(state) {
      const lsState = JSON.parse(localStorage.getItem("aleSettings"));
      if (lsState) {
        _.assign( state.sticky, lsState );
        this.replaceState(state);
      }
    },

    prop: function(state, o) {
      state[o.key] = o.value;
    },

    stickyProp: function(state, o) {
      state.sticky[o.key] = o.value;
    },
    
    addListRenderingOpts: function(state, o) {
      
      if ( o.sortValues !== undefined ) {
        let sortValues = _.find( state.listRenderingOpts.sort, { key: 'sortValues' });
        if ( sortValues ) sortValues.active = o.sortValues;
      }
      
      state.listRenderingOpts[o.listName].push( o.option );
      
      if ( o.activate ) {
        if ( o.listName === 'sort' ) {
          const currentSorter = _.find( state.listRenderingOpts[o.listName], "current" );
          if ( currentSorter ) currentSorter.current = false;
          o.option.current = true;
        }
        else {
          const currentlyActive = _.find( state.listRenderingOpts[o.listName], "active" );
          currentlyActive.active = false;
          o.option.active = true;
        }
      }
      
    },
    
    updateListRenderingOpts: function(state, o) {
      
      let newObject = _.cloneDeep( state.listRenderingOpts[o.listName][o.index] );
      newObject.active = o.active;
      
      // Changes the currently active sorter (in sort: active state controls the direction)
      if ( o.listName === "sort" && newObject.type === 'sort' ) {
        const currentSorter = _.find( state.listRenderingOpts[o.listName], "current" );
        currentSorter.current = false;
        newObject.current = true;
      }
      
      state.listRenderingOpts[ o.listName ].splice(o.index, 1, newObject);
            
    },
    
  },
  
  getters: {
    sortValues: function( state ) {
      return _.find( state.listRenderingOpts.sort, { key: "sortValues" }).active;
    },
    sortBy: function( state ) {
      return _.find( state.listRenderingOpts.sort, 'current').key;
    },
    filterKeys: function( state ) {
      return _.map(_.filter( state.listRenderingOpts.filter, 'active'), function( o ) {
        return o.key;
      }).join(',');
    },
    scopeKeys: function( state ) {
      return _.map(_.filter( state.listRenderingOpts.scope, 'active'), function( o ) {
        return o.key;
      }).join(',');
    },
    searchIsActive: function( state ) {
      return state.searchQuery.trim() !== "";
    },
    // collection: function( state ) {
    //   return _.get(state, state.collectionSource);
    // },
    collection: function( state ) {
      const searchIsActive = state.searchQuery.trim() !== "";
      if ( searchIsActive )  console.log('SEARCH IS ACTIVE');
      
      if ( searchIsActive ) {
        return state.searchCollection;
      }
      else {
        return state.mutatingCollection;
      }
    },
  }
  
});
