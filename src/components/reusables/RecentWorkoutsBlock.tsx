import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter';
import { Button, IconButton } from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from '@material-ui/core/Snackbar';

import { setWorkout, setTotalTime } from "../desktop-components/pages/Home";
import { Exercise } from "../../types";


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      margin: 'auto',
      maxWidth: 500,
    },
    image: {
      width: 128,
      height: 128,
    },
    img: {
      margin: 'auto',
      display: 'block',
      maxWidth: '100%',
      maxHeight: '100%',
    },
    icon_size: {
      scale: "100%"
    }
  }),
);


type Props = {
  name: string;
}


const HOSTNAME = window.location.hostname

async function loadWorkout(workoutName: string) {
  type ExerciseNameWrapped = {
    element: string;
  };

  type ReturnedWorkout = {
    workoutElements: ExerciseNameWrapped[];
  };
  fetch(`http://${HOSTNAME}:3001/recents/${workoutName}`)

  const response = await fetch(
    `http://${HOSTNAME}:3001/workouts/${workoutName}`
  );
  const workout = (await response.json()) as ReturnedWorkout;
  const exerciseNames: string[] = [];

  // console.log("workout: ", workout);
  workout.workoutElements.forEach((e: ExerciseNameWrapped, i: number) => {
    // console.log(`workoutElements[${i}]`, e);
    exerciseNames.push(e.element);
  });

  // console.log("exerciseNames: ", exerciseNames);

  const exercises: Exercise[] = [];
  let netTime: number = 0;

  for (let i = 0; i < exerciseNames.length; i++) {
    const name = exerciseNames[i];
    const res = await fetch(`http://${HOSTNAME}:3001/exercises/${name}`);
    const exercise = await res.json() as Exercise;
    netTime += exercise.duration.minutes * 60000 + exercise.duration.seconds * 1000;

    console.log("Added exercise " + exercise.name);
    exercises.push(exercise);
  }

  // console.log("netTime is " + netTime);
  setTotalTime(netTime);

  setWorkout({
    name: workoutName,
    exercises: exercises
  });
}

export default function RecentWorkoutsBlock(props: Props) {
  const classes = useStyles();
  const [openLoad, setOpenLoad] = React.useState(false);

  const handleClickLoad = () => {
    setOpenLoad(true);
  };

  const handleCloseLoad = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenLoad(false);
  };



  return (
    <div className={classes.root}>

      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={openLoad}
        autoHideDuration={6000}
        onClose={handleCloseLoad}
        message={`${props.name} Loaded`}
        action={
          <React.Fragment>
            <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseLoad}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      />


      <Paper className={classes.paper}>
        <Grid container spacing={2}>
          <Grid item>
            <ButtonBase className={classes.image}>
              <FitnessCenterIcon
                fontSize="large"
                color="primary">
              </FitnessCenterIcon>
            </ButtonBase>
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction="column" spacing={2}>
              <Grid item xs>
                <Typography gutterBottom variant="subtitle1">
                  Name: {props.name}
                </Typography>
              </Grid>
              <Grid item>
                <Button variant="contained" color="primary" startIcon={<GetAppIcon />} value={props.name} onClick={() => {
                  loadWorkout(props.name);
                  handleClickLoad();
                }}>
                  Load
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}