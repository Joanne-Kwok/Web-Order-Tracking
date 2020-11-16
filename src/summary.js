'use strict'

var orderDB = db.collection('orders');
const Container = ReactBootstrap.Container;
const Row = antd.Row;
const Col = antd.Col;
const Form = antd.Form;
const { Option } = antd.Select;


// Checkbox
class CheckBox extends React.Component{
  formRef = React.createRef();

  constructor(props){
    super(props);
    this.state = {
      dataAll: [],
      ttlEarn: 0,
      ttlEarnAll: 0,
      submitValid: false,
      allFields: [ {display: "Brand", dbName: "Brand"},{display: "Color", dbName: "Color"},{display: "Customer", dbName: "Name"},{display: "Item", dbName: "Item"} ],
      searchfield: null,
      barData: [],
      topData: [],
      dataBrand: [],
      dataColor: [],
      dataCustomer: [],
      dataItem: [],
    };

    this.renderCheckBoxGroup = this.renderCheckBoxGroup.bind(this);
    this.handleClear = this.handleClear.bind(this);
  }

  componentDidMount(){
    var dataBrandTemp = [];
    var dataColorTemp = [];
    var dataItemTemp = [];
    var dataCustomerTemp = [];
    var ttlEarnTemp=0;
    var temp = {};

    console.log("didmount")

    var o = {id: '00', dt: 'Select All', isCheck: false};
    dataBrandTemp.push(o);
    dataColorTemp.push(o);
    dataItemTemp.push(o);
    dataCustomerTemp.push(o);

    orderDB.onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {  //use 4 arrays to store...
        o = {id: doc.id, dt: doc.data().Brand, isCheck: false};
        dataBrandTemp.push(o);
        o = {id: doc.id, dt: doc.data().Color, isCheck: false};
        dataColorTemp.push(o);
        o = {id: doc.id, dt: doc.data().Item, isCheck: false};
        dataItemTemp.push(o);
        o = {id: doc.id, dt: doc.data().Name, isCheck: false};
        dataCustomerTemp.push(o);

        ttlEarnTemp += doc.data().Revenue * 1;
     
    });
    // Remove duplicate     
    dataBrandTemp = dataBrandTemp.reduce((current, next) => {
      temp[next.dt] ? "": temp[next.dt] = true && current.push(next)
      return current;
    }, [])

    temp={};
    dataColorTemp = dataColorTemp.reduce((current, next) => {
      temp[next.dt] ? "": temp[next.dt] = true && current.push(next)
      return current;
    }, [])

    temp={};
    dataItemTemp = dataItemTemp.reduce((current, next) => {
      temp[next.dt] ? "": temp[next.dt] = true && current.push(next)
      return current;
    }, [])

    temp={};
    dataCustomerTemp = dataCustomerTemp.reduce((current, next) => {
      temp[next.dt] ? "": temp[next.dt] = true && current.push(next)
      return current;
    }, [])

    //sort
    dataBrandTemp.splice(dataBrandTemp.findIndex( i => i.id="00"),1);
    dataBrandTemp.sort( (a,b) => { return (a.dt.localeCompare(b.dt)); } );
    dataBrandTemp.unshift({id: '00', dt: 'Select All', isCheck: false});

    dataColorTemp.splice(dataColorTemp.findIndex( i => i.id="00"),1);
    dataColorTemp.sort( (a,b) => { return (a.dt.localeCompare(b.dt)); } );
    dataColorTemp.unshift({id: '00', dt: 'Select All', isCheck: false});

    dataCustomerTemp.splice(dataCustomerTemp.findIndex( i => i.id="00"),1);
    dataCustomerTemp.sort( (a,b) => { return (a.dt.localeCompare(b.dt)); } );
    dataCustomerTemp.unshift({id: '00', dt: 'Select All', isCheck: false});

    dataItemTemp.splice(dataItemTemp.findIndex( i => i.id="00"),1);
    dataItemTemp.sort( (a,b) => { return (a.dt.localeCompare(b.dt)); } );
    dataItemTemp.unshift({id: '00', dt: 'Select All', isCheck: false});

      this.setState({ 
        dataBrand: dataBrandTemp,
        dataColor: dataColorTemp,
        dataCustomer: dataCustomerTemp,
        dataItem: dataItemTemp,
        ttlEarnAll: ttlEarnTemp,
      })
      });
  }

// click button 
  handleClick(field){
 
    var dataset = [];
    var o = {id: '00', dt: 'Select All', isCheck: false};

    dataset.push(o);

    this.handleClear();

    if(field === "Brand"){ dataset = this.state.dataBrand; }
    else if (field === "Color"){ dataset = this.state.dataColor; }
    else if (field === "Item"){ dataset = this.state.dataItem; }
    else if (field === "Name"){ dataset = this.state.dataCustomer; }
  
    this.setState({ 
      dataAll: dataset,
      searchfield: field,
    })
  }



// handle select option
  handleSelect(index){
    var temp = this.state.dataAll.slice();
    var isValid = index.length > 0 ? true : false;

    for (var i = 0 ; i < temp.length; i++){

      if (i === 0 && index.includes(i)) {
        temp.forEach(d => d.isCheck = true);
        break;
      }

      index.includes(i) ? temp[i].isCheck = true : temp[i].isCheck = false;
    }

 //   console.log(temp);
    this.setState({ 
      dataAll: temp, 
      submitValid: isValid, })
  }

  // handle submit button
  handleSubmitButton(){
    var collect = [];
    var collectall = [];
    var earn = 0;
    var earnAll = 0;
    var dataAll = this.state.dataAll.slice();
    var barTemp = [];
    var barTemp2 = []
    var o = {};

    //check if valid?
    dataAll.some( c=> c.isCheck ? true : false ) ? console.log("valid") : antd.message.warning('please select at least one item before submiting!');

    dataAll.forEach( (d) => {
      if (d.isCheck && d.id !== "00"){
        collect.push(d.dt);
      }
      if (d.id !== "00"){ 
      collectall.push(d.dt);
      }
    } );

    console.log("submit")
  //calculate total revenue
  collectall.forEach( (i) => {
    orderDB.where(this.state.searchfield,"==",i).onSnapshot((querySnapshot) => {
      earn = 0;
      querySnapshot.forEach((doc) => {
      earn += doc.data().Revenue * 1;
      earnAll += doc.data().Revenue * 1;
      } );
      o = { field: this.state.searchfield, name: i, earnings: earn };
      barTemp2.push(o);
      if(collect.indexOf(i) > -1) { barTemp.push(o);}

      this.setState({
          topData: barTemp2,
          barData: barTemp,
          ttlEarn: earnAll,
        }, () =>{  if(barTemp2.length === collectall.length) {
           this.props.getData(this.state.barData, this.state.topData, this.state.ttlEarnAll); 
          }    }
        )
      });
  } )

}

handleClear(){

  this.formRef.current.setFieldsValue({
    specific_item: undefined,
  });

  this.setState({
    submitValid: false,
  })

}

  // First 2 search boxes
  renderCheckBoxGroup(){

    return (
      <div>
    <Form ref={this.formRef}>
    <Row gutter={16}>
    <Col span={20} offset={1}>
    <Form.Item
    name="search_field"
    label = "Summarise by: "
    rules={[{ required: true, message: 'Please select a field' }]}
    >
    <antd.Select 
    placeholder="Please select a field" 
    showSearch
    onChange = {this.handleClick.bind(this)}
    >
    {this.state.allFields.map( (i,k) => ( <Option value={i.dbName} key={k+i.dbName} > {i.display} </Option> ) )}
    </antd.Select>
    </Form.Item>
    </Col>
    </Row>

<Row gutter={16}>
<Col span={20} offset={1}>
    <Form.Item
    label = "Specific item: "
    name="specific_item" 
    
    rules={[{ required: true, message: 'Please select at least one item' }]}
    >
      <antd.Select
       mode="multiple"
      
       allowClear
       showArrow
       placeholder = { "Search by specific item(s)"}
       onChange = { this.handleSelect.bind(this)}
       optionFilterProp="label"
      >
      {this.state.dataAll.map( (v,i) => ( <Option label={v.dt} value={i} key={i} > {v.dt} </Option> ))}

      </antd.Select>
      
      </Form.Item>
      </Col>

      <Col span={1} >
    <Form.Item >  
      <antd.Button onClick={ this.handleClear} > Clear </antd.Button>  
    </Form.Item>
    </Col>
    
</Row>

      <Row>
        <Col span={1} offset={10}>
      <button className="btn btn-outline-danger" disabled={!(this.state.submitValid)} onClick={ () =>  this.handleSubmitButton()} > Summarise </button>  
   
    </Col>
      </Row>
      </Form>
    </div>
    );
  }

  render(){

    return (
      <div >
        <this.renderCheckBoxGroup />
    </div>
    );
  }
}

class Charts extends React.Component{
  constructor(props){
    super(props)
    this.barChart = this.barChart.bind(this);
    this.pieChart = this.pieChart.bind(this);
  }

  barChart(props){
    let visible = this.props.data.length > 0 ? true : false;

    return(
    <BizCharts.ColumnChart 
      data = {props.showd}
      forceFit
      padding='auto'
      appendPadding={[20,0,35,0]}
      xField='name'
      yField='earnings'
      color="#c47f96"
      title={{
        text: props.title,
        visible: visible,
        }}
      description={{
        text: props.des,
        visible: visible,
        }}
      meta={{
        name: {
          alias: props.name,
        },
        earnings: {
          alias: 'Earnings (aud)',
        },
      }}
    />
    )
  }


  pieChart(){
    const ttlRevenueTemp = this.props.ttlRevenue;
    var pctData = [];
    var show = [];
    var counted = 0;
    var single ;
    var visible = this.props.data.length > 0 ? true : false;

  if (ttlRevenueTemp > 0) {
    this.props.data.forEach( (d) => {
      counted += d.earnings;
      single = {name: d.name, percent: Number((d.earnings / ttlRevenueTemp)*100).toFixed(2)};
      pctData.push(single);
    } )

  
    var others =  ( (ttlRevenueTemp - counted) / ttlRevenueTemp) ;
    if (others > 0){
      single = {name: "Others", percent: Number(others*100).toFixed(2)};
      pctData.push(single);
    }
  }

    var show = pctData.length > 1 ? pctData : [] ;

    return(
      <BizCharts.PieChart
      data={show}
      title={{
        visible: visible,
        text: 'Percentage(%)',
      }}
      description={{
        visible: visible,
        text: 'Percentage of these items in total revenue',
      }}
      radius={0.8}
      angleField='percent'
      colorField='name'
      label={{
        visible: true,
        type: 'outer',
        offset: 20,
      }}
    />
    )
  }

  render(){
    var money = 0;
    let top;
    let name;

    this.props.data.forEach( (d) => { money += d.earnings ;} );

    top = this.props.topdata.slice();
    top.sort((a,b) => {return b.earnings - a.earnings; });
    top = top.slice(0,10);

    name = top.length > 0 ?  top[0].field  : null;
    name = (name === "Name") ? "customer" : name;

    return(
      <dir>
<Container>
      <antd.Divider /> 
      <antd.Statistic title="Earnings" valueStyle={{ color: 'green' }} value={money} precision={2} />
      <ReactBootstrap.Row> <ReactBootstrap.Col><this.barChart name={name} showd={this.props.data} title={"Comparison"} des={"Comparison of earnings between different items"}/> </ReactBootstrap.Col> </ReactBootstrap.Row>
      <antd.Divider /> 
      <ReactBootstrap.Row> <ReactBootstrap.Col><this.pieChart /> </ReactBootstrap.Col>  </ReactBootstrap.Row>
      <antd.Divider /> 
      <ReactBootstrap.Row> <ReactBootstrap.Col><this.barChart name={name} showd={top} title={"Top 10 " + name} des={ "Earning most revenue from these top 10 " + name.toLowerCase() + "s" }/> </ReactBootstrap.Col> </ReactBootstrap.Row>
</Container>
      </dir>
    )
  }

}

// Whole page
class SumPage extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      barData: [],
      topData: [],
      ttlRevenue: 0,
  }
}

getData(data, all, revenue){
  this.setState({
    barData: data,
    topData: all,
    ttlRevenue: revenue,
  })
}

  render(){

    if(this.state.topData.length > 0){
      return(
        <dir>
        <Container>
        
        <CheckBox getData={ (barData, topData, ttlRevenue) => this.getData(barData, topData, ttlRevenue)} />

        <Charts data={this.state.barData} topdata={this.state.topData} ttlRevenue={this.state.ttlRevenue}/> 

        </Container>
    
        </dir>
        
      );

    }else{
      return(
        <dir>
        <Container>

        <CheckBox getData={ (barData, topData, ttlRevenue) => this.getData(barData, topData, ttlRevenue)} />
    
        </Container>
        </dir>
        
      );
    }

    }

}


const domContainer = document.querySelector('#input_form');
ReactDOM.render(<SumPage />, domContainer);