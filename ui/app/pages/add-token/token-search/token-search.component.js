import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import contractMap from '@metamask/contract-metadata';
import Fuse from 'fuse.js';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '../../../components/ui/text-field';
import api from '../../../../../app/api';
import contractMap from '../../../../../app/contract-bohrdata';

const contractList = Object.entries(contractMap)
  .map(([address, tokenData]) => ({ ...tokenData, address }))
  .filter((tokenData) => Boolean(tokenData.erc20));

const fuse = new Fuse(contractList, {
  shouldSort: true,
  threshold: 0.45,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    { name: 'name', weight: 0.5 },
    { name: 'symbol', weight: 0.5 },
  ],
});

export default class TokenSearch extends Component {
  static contextTypes = {
    t: PropTypes.func,
  };

  static defaultProps = {
    error: null,
  };

  static propTypes = {
    onSearch: PropTypes.func,
    error: PropTypes.string,
  };

  state = {
    searchQuery: '',
  };

  async handleSearch(searchQuery) {
    // this.setState({ searchQuery });
    // console.log('----fuse----', fuse);
    // console.log('----contractList----', contractList);
    // const fuseSearchResult = fuse.search(searchQuery);
    // console.log('----fuseSearchResult----', fuseSearchResult);
    //
    // const addressSearchResult = contractList.filter((token) => {
    //   return token.address.toLowerCase() === searchQuery.toLowerCase();
    // });
    // console.log('----addressSearchResult----', addressSearchResult);
    //
    // const results = [...addressSearchResult, ...fuseSearchResult];
    // console.log('----results----', results);
    //
    // this.props.onSearch({ searchQuery, results });

    this.setState({ searchQuery });
    let contractAddress = '';
    if (searchQuery.length < 35) {
      contractAddress = searchQuery;
    } else if (searchQuery.indexOf('B') === 0 && searchQuery.length === 35) {
      // contractAddress = '0x' + this.addressDecode(searchQuery);
    }

    const param = {
      pageNumber: 1,
      pageSize: 20,
    };

    const data = await api.tokenContractQuery(contractAddress, param);

    const searchResultArr = [];
    for (const item of data) {
      searchResultArr.push({
        address: item.contractAddress,
        decimals: parseInt(item.tokenDecimals),
        erc20: true,
        logo: item.iconUrl ? item.iconUrl : '',
        name: item.tokenName,
        symbol: item.tokenSymbol,
      });
    }
    // address: "0x1c4481750daa5Ff521A2a7490d9981eD46465Dbd"
    // decimals: 18
    // erc20: true
    // logo: "bcpt.svg"
    // name: "BlockMason Credit Protocol Token"
    // symbol: "BCPT"

    const results = searchResultArr;
    this.props.onSearch({ searchQuery, results });
  }

  renderAdornment() {
    return (
      <InputAdornment position="start" style={{ marginRight: '12px' }}>
        <img src="images/search.svg" width="17" height="17" alt="" />
      </InputAdornment>
    );
  }

  render() {
    const { error } = this.props;
    const { searchQuery } = this.state;

    return (
      <TextField
        id="search-tokens"
        placeholder={this.context.t('searchTokens')}
        type="text"
        value={searchQuery}
        onChange={(e) => this.handleSearch(e.target.value)}
        error={error}
        fullWidth
        autoFocus
        autoComplete="off"
        startAdornment={this.renderAdornment()}
      />
    );
  }
}
