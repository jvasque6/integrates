import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import IndicatorBox from './index';
import 'mocha'
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('Indicator Box', () => {
  it('should return a function', () => {
    expect(typeof(IndicatorBox)).to.equal('function');
  });

  it('should be render', () => {
    const wrapper = shallow(
      <IndicatorBox 
        backgroundColor="#070"
        color="#700"
        icon="fa fa-star"
        name="Unit test"
        quantity="666"
        title="Unit title"
      />
    );
    expect(
      wrapper.contains(
        <div className="col-md-3 col-xs-12">
          <div
            className="widget-box equalWidgetHeight"
            data-toggle="tooltip"
            data-placement="top"
            title="Unit title"
            style={{backgroundColor: "#070", color: "#700"}}
          >
            <div className="col-md-4 col-xs-4">
              <div className="widget-icon">
                  <span className="fa fa-star"/>
              </div>
            </div>
            <div className="col-md-8 col-xs-8">
              <div
                data-toggle="counter"
                className="widget-value"
              >
                666
              </div>
              <div className="widget-desc">
                Unit test
              </div>
            </div>
          </div>
        </div>
      )
    ).to.equal(true);
  });
});