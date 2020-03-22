import React from 'react';
import './index.css';

function ProductTableRow(props) {
    console.log(`quantity ${props.quantity}`);
    return (
        <tr className="product-table-row">
            <td>{props.row.productName}</td>
            <td>{props.row.quantityInStock}</td>
            <td>{props.row.buyPrice}</td>
            <td><input type="number" value={props.quantity} onChange={props.handleChange} /></td>
        </tr>
    );
  }

class Products extends React.Component {
    state = {
        products: [],
        quantities: []
    };

    componentDidMount() {
        fetch(`https://peak-radius-271712.appspot.com/api/listproducts?supermarketid=${this.props.market}`)
        .then(res => res.json())
        .then(result => {
            const quantities = Array(result.length).fill(0);
            this.setState({products: result, quantities});
        });
    }

    updateQuantity(id, value) {
        const {quantities, products} = this.state;
        console.log(id, value);
        quantities[products.findIndex(element => element.id === id)] = Number(value);
        console.log(quantities[id]);
        this.setState({quantities});
    }

    order() {
        const {products, quantities} = this.state;
        const productIds = [];
        const quantitiesArray = [];
        for (let i = 0; i < products.length; i++) {
            if (quantities[i] > 0) {
                productIds.push(products[i].id);
                quantitiesArray.push(quantities[i]);
            }
        }
        console.log(`ordering ${productIds} ${quantitiesArray}`);
        fetch(`https://peak-radius-271712.appspot.com/api/shoppinglist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'productIds': productIds,
                'quantities': quantitiesArray,
                'supermarketId': this.props.market,
                'userId': 1
            })
        })
        .then(res => res.text())
        .then(result => {
            console.log(result);
            this.props.order();
        });
    }

    render() {
        const { products, quantities } = this.state;
        let productsTable;
        if (products) {
            console.log(quantities);
            productsTable = products.map((row, index) => {
            return (
              <ProductTableRow
                row={row}
                key={row.id}
                quantity={quantities[index]}
                handleChange={event => this.updateQuantity(row.id, event.target.value)}
              />
            );
          });
        }
        return(
            <div>
              <h1>Produkte</h1>
              {products &&
                <table>
                  <thead>
                    <tr>
                      <td>Name</td>
                      <td>Verfügbare Anzahl</td>
                      <td>Preis</td>
                      <td>Gewünschte Anzahl</td>
                    </tr>
                  </thead>
                  <tbody>
                    {productsTable}
                  </tbody>
                </table>
              }
              <div>
                <button onClick={() => this.order()}>
                    Bestellen
                </button>
              </div>
            </div>
        ); 
    }
}

export default Products;