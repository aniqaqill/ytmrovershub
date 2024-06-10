import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Typography, Grid, Card, CardContent, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, List, ListItem, Chip } from '@mui/material';
import BaseLayout from '~/components/BaseLayout';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';


const CoordinatorDashboard: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: programs } = api.programInfo.getAllProgram.useQuery();
  const { data: materials } = api.materialInfo.getAllAidMaterial.useQuery();
  const { data: volunteers } = api.userInfo.getAllUser.useQuery();

  const [totalPrograms, setTotalPrograms] = React.useState(0);
  const [totalVolunteers, setTotalVolunteers] = React.useState(0);
  const [averageAttendance, setAverageAttendance] = React.useState(0);
  const [totalMaterials, setTotalMaterials] = React.useState(0);

  const isLoggedInCoordinator = useMemo(() => {
    return session?.user?.role === 'coordinator';
  }, [session]);

  useEffect(() => {
    if (!isLoggedInCoordinator) {
      void router.push('/');
    }
  }, [isLoggedInCoordinator, router]);

  useEffect(() => {
    if (programs) {
      setTotalPrograms(programs.length);
      const totalAttendance = programs.reduce((sum, program) => sum + (program.volunteers?.length || 0), 0);
      setAverageAttendance(programs.length ? totalAttendance / programs.length : 0);
    }
  }, [programs]);

  useEffect(() => {
    if (volunteers) {
      setTotalVolunteers(volunteers.length);
    }
  }, [volunteers]);

  useEffect(() => {
    if (materials) {
      const totalUsedMaterials = materials.reduce((sum, material) => sum + material.quantity, 0);
      setTotalMaterials(totalUsedMaterials);
    }
  }, [materials]);

  const getProgramStatus = (endDate: Date) => {
    const today = new Date();
    const programEndDate = new Date(endDate);
    return today > programEndDate ? 'Completed' : 'Ongoing';
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTimeTo12Hour = (time24: string) => {
    const [hoursStr, minutes] = time24.split(":");
    const hours = parseInt(hoursStr ?? "0", 10);

    if (isNaN(hours)) {
      return "";
    }

    const suffix = hours >= 12 ? "PM" : "AM";
    const hours12 = ((hours % 12) || 12).toString().padStart(2, "0");
    return `${hours12}:${minutes} ${suffix}`;
  };

  return (
    <BaseLayout>
      <Typography variant="h5" gutterBottom>
        Coordinator Analytics Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body1">Total Programs Coordinated</Typography>
              <Typography variant="h4">{totalPrograms}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body1">Total Volunteers Enrolled</Typography>
              <Typography variant="h4">{totalVolunteers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body1">Average Program Attendance</Typography>
              <Typography variant="h4">{averageAttendance.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body1">Total Aid Materials Used</Typography>
              <Typography variant="h4">{totalMaterials}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <section>
        <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
          Programs Overview
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Program Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Volunteers Enrolled</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programs?.map(program => (
                <TableRow key={program.id}>
                    <TableCell>{program.name}</TableCell>
                    <TableCell>{formatDate(program.startDate)}</TableCell>
                    <TableCell>{formatTimeTo12Hour(program.startTime)}</TableCell>
                    <TableCell>{program.location}</TableCell>
                    <TableCell>{program.volunteers?.length || 0}</TableCell>
                    <TableCell>
                        <Chip
                            label={getProgramStatus(program.startDate)}
                            color={
                            getProgramStatus(program.startDate) === 'Completed'
                                ? 'success'
                                : 'secondary'
                            }
                        />
                        </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Volunteer Insights
          </Typography>
          <List component={Paper}>
            <Typography variant="body1" gutterBottom>
              Top Volunteers
            </Typography>
            {volunteers?.map(volunteer => (
              <ListItem key={volunteer.id}>{volunteer.name}</ListItem>
            ))}
          </List>
          <Card style={{ marginTop: '20px' }}>
            <CardContent>
              <Typography variant="body1">Volunteer Participation Rate</Typography>
              {/* <PieChart data=participation rate data /> */}
            </CardContent>
          </Card>
          {/* <List component={Paper} style={{ marginTop: '20px' }}>
            <Typography variant="body1" gutterBottom>
              Recent Feedback
            </Typography>
            {feedback.map(item => (
              <div key={item.id}>{item.content}</div>
            ))}
          </List> */}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Form Submissions
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="body1">Form Status Distribution</Typography>
              {/* <PieChart data=form status data /> */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <section style={{ marginTop: '20px' }}>
        <Typography variant="h5" gutterBottom>
          Aid Material Usage
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1">Material Usage Summary</Typography>
            {/* <BarChart data=material usage data /> */}
          </CardContent>
        </Card>
        <List component={Paper} style={{ marginTop: '20px' }}>
          <Typography variant="body1" gutterBottom>
            Most Used Materials
          </Typography>
          {/* {mostUsedMaterials.map(material => (
            <div key={material.id}>{material.name}</div>
          ))} */}
        </List>
      </section>
    </BaseLayout>
  );
};

export default CoordinatorDashboard;
