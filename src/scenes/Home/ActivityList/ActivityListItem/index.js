import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Icon, Text } from 'blockchain-info-components'

const Row = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 80px;
`
const MarkerContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  width: 60px;
  height: 100%;
`
const MarkerBorder = styled.div`
  height: 100%;
  width: 1px;
  background-color: #D2CED0;
  margin-left: 15px;
`
const MarkerCircle = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  background-color: white;
  border: 1px solid #d2ced0;
  border-radius: 100%;
  text-align: center;
`
const LogContainer = styled.div`
  width: calc(100% - 60px);
  height: 100%;
`
const InfoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 40px;
  padding: 8px 0;
  border: 1px solid #D2CED0;
`
const TypeContainer = styled.div`
  width: 30%;
  padding: 0 5px;
`
const TimeContainer = styled.div`
  width: 30%;
  padding: 0 5px;
`
const DetailsContainer = styled.div`
  width: 40%;
  padding: 0 5px;
`

const ActivityListItem = (props) => {
  return (
    <Row>
      <MarkerContainer>
        <MarkerBorder />
        <MarkerCircle>
          <Icon name='tx' color='dark-blue' />
        </MarkerCircle>
      </MarkerContainer>
      <LogContainer>
        <InfoContainer>
          <TypeContainer>
            <Text size='12px' weight='300' capitalize>{props.activity.title}</Text>
          </TypeContainer>
          <TimeContainer>
            <Text size='12px' weight='300'>{props.activity.time}</Text>
          </TimeContainer>
          <DetailsContainer>
            <Text size='12px' weight='300'>{props.activity.description}</Text>
          </DetailsContainer>
        </InfoContainer>
      </LogContainer>
    </Row>
  )
}

ActivityListItem.propTypes = {
  activity: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired
  })
}

export default ActivityListItem
