# VARI-Net Temple Queue Training Dataset

File: `wari_temple_queue_dataset_8Jul_29Jul_2026.csv`

## Purpose

This dataset is used to train the VARI-Net MVP model for predicting
estimated temple queue waiting time in minutes.

## Data status

This is synthetic MVP training data created from operational queue-flow
assumptions. It is not official data from the Pandharpur Temple Trust.

Before a real deployment, the model must be recalibrated using verified
field observations, including gate throughput, queue counts, darshan
status, festival-day demand, and actual pilgrim waiting times.

## Target field

`queue_minutes`

## Main inputs

- Hour and date
- Zone, location, and route type
- Waiting people
- Darshan status
- Gates open
- Crowd count and density
- Peak-day flag