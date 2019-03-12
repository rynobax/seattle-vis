import React, { useState } from 'react';
import { useAirtable } from './airtable';
import styled from 'styled-components';
import Table from './Table';
import { useGeoPosition } from './useLocation';
import { getETA } from './eta';

const App: React.FC = () => {
  const position = useGeoPosition();
  const [tab, setTab] = useState(0);
  const { data, error, loading } = useAirtable();
  if (error) return <span>{error.message}</span>;
  if (loading || !data) return <span>Loading...</span>;
  // const etas = useETA(data, position);
  if(position) {
    getETA(position, '86 Pike Pl, Seattle, WA 98101')
      .then(res => console.log(res));
  }

  const items = tab === 0 ? data.events : data.meals;
  return (
    <div>
      <Header>
        <Tab type="button" onClick={() => setTab(0)}>
          🎢
        </Tab>
        <TabDivider />
        <Tab type="button" onClick={() => setTab(1)}>
          🍕
        </Tab>
      </Header>
      <Content>
      <div>{JSON.stringify(position, null, 2)}</div>
        <Table items={items} />
      </Content>
    </div>
  );
};

const HEADER_SIZE = '48px';

const Header = styled.div`
  display: flex;
  flex-direction: row;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_SIZE};
`;

const Tab = styled.button`
  flex: 1;
  text-align: center;
  background: #bbbbee;
  padding: 16px;
  border: none;
  cursor: pointer;
`;

const TabDivider = styled.div`
  flex: 0 0 8px;
  background: white;
`;

const Content = styled.div`
  margin-top: ${HEADER_SIZE};
`;

export default App;
