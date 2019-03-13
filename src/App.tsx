import React, { useState } from 'react';
import { useAirtable } from './airtable';
import styled from 'styled-components';
import Table from './Table';
import { useGeoPosition } from './useLocation';
import { useETAS } from './eta';
import times from 'lodash/times';

const useData = () => {
  const [percent, setPercent] = useState(0);
  const updatePercent = () => setPercent(p => p + 33);
  const currentLoc = useGeoPosition(updatePercent);
  const airtableRes = useAirtable(updatePercent);
  const items = airtableRes.data ? [...airtableRes.data.events, ...airtableRes.data.meals] : [];
  const etas = useETAS(items, currentLoc, updatePercent);
  return {
    data: { airtable: airtableRes.data, etas: etas.data },
    loading: airtableRes.loading || etas.loading,
    error: airtableRes.error || etas.error,
    percent,
  };
};

const PERCENT_INTERVAL = 3;

const App: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [walking, setWalking] = useState(true);
  const { error, loading, data, percent } = useData();

  if (error) {
    console.error(error);
    return <ErrorMessage>{error.message}</ErrorMessage>;
  }

  if (loading || !data.airtable || !data.etas) {
    const INTERVAL_SIZE = 100 / PERCENT_INTERVAL;
    return (
      <PercentContainer>
        {times(PERCENT_INTERVAL).map(i => {
          const done = percent >= i * INTERVAL_SIZE + 1;
          return done ? <ActivePercent key={i} /> : <PassivePercent key={i} />;
        })}
      </PercentContainer>
    );
  }

  const {
    airtable: { events, meals },
    etas,
  } = data;

  const items = tab === 0 ? events : meals;
  return (
    <>
      <Header>
        <Tab type="button" onClick={() => setTab(0)} active={tab === 0}>
          🎢
        </Tab>
        <Tab type="button" onClick={() => setTab(1)} active={tab === 1}>
          🍕
        </Tab>
        <Tab active={false} disabled />
        <Tab type="button" onClick={() => setWalking(true)} active={walking}>
          🚶
        </Tab>
        <Tab type="button" onClick={() => setWalking(false)} active={!walking}>
          🚗
        </Tab>
      </Header>
      <Content>
        <Table items={items} etas={etas} walking={walking} />
      </Content>
    </>
  );
};

const THEME_COLOR = '#bbbbee';

const HEADER_SIZE = '48px';

const Header = styled.div`
  display: flex;
  flex-direction: row;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: ${HEADER_SIZE};
  z-index: 1;
  background: white;
  box-shadow: 0 1px 6px 0 rgba(32, 33, 36, 0.28);
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  text-align: center;
  background: ${THEME_COLOR};
  padding: 0px;
  font-size: 26px;
  border: none;
  cursor: pointer;
  opacity: ${p => (p.active ? '1' : '0.5')};
`;

const Content = styled.div`
  margin-top: ${HEADER_SIZE};
`;

const PreContent = styled.div`
  padding: 16px;
  font-size: 18px;
`;

const ErrorMessage = styled(PreContent)`
  color: hsla(0, 100%, 17%, 1);
`;

const PercentContainer = styled.div`
  position: fixed;
  top: 28%;
  display: flex;
  flex-direction: row;
  width: 100vw;
  justify-content: space-evenly;
`;

const Percent = styled.div`
  background-color: ${THEME_COLOR};
  width: 50px;
  height: 50px;
`;

const START_STYLE = `
  opacity: 0.4;
  transform: scale(0.5);
`;

const END_STYLE = `
  opacity: 1;
  transform: scale(1);
`;

const PassivePercent = styled(Percent)`
  ${START_STYLE}
`;

const ActivePercent = styled(Percent)`
  @keyframes fadein {
    from {
      ${START_STYLE}
    }
    to {
      ${END_STYLE}
    }
  }
  animation: fadein 0.5s;
  ${END_STYLE}
`;

export default App;
