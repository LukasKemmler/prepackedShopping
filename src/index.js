import React from 'react';
import ReactDOM from 'react-dom';
import Products from './Products';
import TimeSlot from './TimeSlot';
import './index.css';

function MarketTableRow(props) {
  return (
      <tr className="market-table-row" onClick={props.onClick}>
          <td>{props.row.name}</td>
          <td>{props.row.city}</td>
      </tr>
  );
}

class MarketSelection extends React.Component {
  state = {
    supermarkets: null
  };

  componentDidMount() {
    fetch("https://peak-radius-271712.appspot.com/api/supermarkets")
    .then(res => res.json())
    .then(result => {
      this.setState({supermarkets: result});
    });
  }

  render() {
    const { supermarkets } = this.state;
    let supermarketsTable;
    if (supermarkets) {
      supermarketsTable = supermarkets.map(row => {
        return (
          <MarketTableRow
            row={row}
            key={row.id}
            onClick={() => this.props.updateMarket(row.id)}
          />
        );
      });
    }
    return(
      <div>
        <h1>Supermärkte</h1>
        {supermarkets &&
          <table>
            <thead>
              <tr>
                <td>Name</td>
                <td>Stadt</td>
              </tr>
            </thead>
            <tbody>
              {supermarketsTable}
            </tbody>
          </table>
        }
      </div>
    )
  }
}

class App extends React.Component {
  state = {
    selectedMarket: null,
    page: 0
  }

  updateMarket(id) {
    this.setState({selectedMarket: id, page: 1});
  }

  order() {
    this.setState({page: 2});
  }

  bookTime() {
    this.setState({page: 3})
  }
  
  render() {
    if (this.state.page === 0) {
      return <MarketSelection updateMarket={(id) => this.updateMarket(id)}/>;
    } else if (this.state.page === 1) {
      return <Products market={this.state.selectedMarket} order={() => this.order()}/>;
    } else if (this.state.page === 2) {
      return <TimeSlot bookTime={() => this.bookTime()}/>;
    } else if (this.state.page === 3) {
      return <div>Danke für Ihre Bestellung!</div>;
    }
  }

}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);