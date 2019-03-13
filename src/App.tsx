import React, { useState } from 'react';
import { useAirtable, Item } from './airtable';
import styled from 'styled-components';
import Table from './Table';
import { useGeoPosition, Loc } from './useLocation';
import { useETA } from './eta';
import faker from 'faker/locale/en_US';

const useData = (currentLoc: Loc | null) => {
  const airtableRes = useAirtable();
  const items = airtableRes.data ? [...airtableRes.data.events, ...airtableRes.data.meals] : [];
  const etas = useETA(items, currentLoc);
  return {
    data: { airtable: airtableRes.data, etas: etas.data },
    loading: airtableRes.loading || etas.loading,
    error: airtableRes.error || etas.error,
  };
};

const loadingText = faker.hacker.phrase();
const App: React.FC = () => {
  const position = useGeoPosition();
  const [tab, setTab] = useState(0);
  const { error, loading, data } = useData(position);
  if (error) return <span>{error.message}</span>;
  if (loading || !data.airtable || !data.etas) return <span>{loadingText}...</span>;
  const {
    airtable: { events, meals },
    etas,
  } = data;

  const items = tab === 0 ? events : meals;
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
        <Table items={items} etas={etas} />
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
