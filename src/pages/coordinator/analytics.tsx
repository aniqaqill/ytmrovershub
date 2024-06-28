import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Typography, Grid, Card, CardContent, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Chip,  FormControl, MenuItem, Select,
  Box, TableFooter, TablePagination, IconButton,
  Stack
} from '@mui/material';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import BaseLayout from '~/components/BaseLayout';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

type CustomLabelProps = {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
};

const COLORS = ['#0088FE', '#00C49F', '#d11d1d'];
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = (props: CustomLabelProps & { percent: number }) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CoordinatorDashboard: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: programs } = api.programInfo.getAllProgram.useQuery();
  const { data: materials } = api.materialInfo.getAllAidMaterial.useQuery();
  const { data: volunteers } = api.userInfo.getAllUser.useQuery();
  const { data: forms } = api.formInfo.getAllForms.useQuery();

  const [totalPrograms, setTotalPrograms] = useState(0);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [formStatusData, setFormStatusData] = useState([
    { name: 'Submitted', value: 0 },
    { name: 'Approved', value: 0 },
    { name: 'Rejected', value: 0 },
  ]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
      const volunteerCount = volunteers.filter(volunteer => volunteer.role === 'volunteer').length;
      setTotalVolunteers(volunteerCount);
    }
  }, [volunteers]);

  useEffect(() => {
    if (materials) {
      const totalUsedMaterials = materials.reduce((sum, material) => sum + material.quantity, 0);
      setTotalMaterials(totalUsedMaterials);
    }
  }, [materials]);

  const getProgramStatus = (startDate: Date, endTime: string) => {
    const today = new Date();
    const programStartDate = new Date(startDate);
    const programEndDate = new Date(startDate);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    programEndDate.setHours(endHours ?? 0, endMinutes ?? 0);
    programEndDate.setDate(programEndDate.getDate() + 1); // Include one day after the end date

    if (today < programStartDate) {
      return 'Upcoming';
    } else if (today >= programStartDate && today <= programEndDate) {
      return 'Ongoing';
    } else {
      return 'Past';
    }
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

  useEffect(() => {
    if (forms) {
      const statusCount = { SUBMITTED: 0, APPROVED: 0, REJECTED: 0 };
      forms.forEach(form => {
        statusCount[form.status]++;
      });
      setFormStatusData([
        { name: 'Submitted', value: statusCount.SUBMITTED },
        { name: 'Approved', value: statusCount.APPROVED },
        { name: 'Rejected', value: statusCount.REJECTED },
      ]);
    }
  }, [forms]);

  const filteredPrograms = useMemo(() => {
    if (programs) {
      return programs.filter(program => {
        const programStatus = getProgramStatus(program.startDate, program.endTime);
        const matchesStatus = statusFilter === 'all' || programStatus === statusFilter;
        return matchesStatus;
      });
    }
    return [];
  }, [programs, statusFilter]);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredPrograms.length - page * rowsPerPage);

  return (
    <BaseLayout>
      <Typography variant="h5" gutterBottom>
        Coordinator Analytics Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body1">Total Programs </Typography>
              <Typography variant="h4">{totalPrograms}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body1">Total Volunteers</Typography>
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
              <Typography variant="body1">Total Aid Materials </Typography>
              <Typography variant="h4">{totalMaterials} units</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <section>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
          Programs Overview
        </Typography>
        <FormControl variant="outlined" >
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            size='small'
            fullWidth
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Upcoming">Upcoming</MenuItem>
            <MenuItem value="Ongoing">Ongoing</MenuItem>
            <MenuItem value="Past">Past</MenuItem>
          </Select>
        </FormControl>
        </Stack>
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
              {(rowsPerPage > 0
                ? filteredPrograms.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : filteredPrograms
              ).map(program => (
                <TableRow key={program.id}>
                  <TableCell>{program.name}</TableCell>
                  <TableCell>{formatDate(program.startDate)}</TableCell>
                  <TableCell>{formatTimeTo12Hour(program.startTime)}</TableCell>
                  <TableCell>{program.location}</TableCell>
                  <TableCell>{program.volunteers?.length || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={getProgramStatus(program.startDate, program.endTime)}
                      color={
                        getProgramStatus(program.startDate, program.endTime) === 'Past'
                          ? 'success'
                          : 'secondary'
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                  colSpan={6}
                  count={filteredPrograms.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </section>

      <Grid container spacing={3} style={{ marginTop: '20px' }}>
            <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Volunteer Insights
          </Typography>
          <TableContainer component={Paper} style={{ maxHeight: 300, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {volunteers?.filter(volunteer => volunteer.role === 'volunteer').map(volunteer => (
                  <TableRow key={volunteer.id}>
                    <TableCell>{volunteer.name}</TableCell>
                    <TableCell>{volunteer.contactNumber ?? 'Information not added'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            Form Submissions
          </Typography>
          <Card>
            <CardContent>
              <Typography variant="body1">Form Status Distribution</Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={formStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <section style={{ marginTop: '20px' }}>
        <Typography variant="h5" gutterBottom>
          Aid Material Inventory
        </Typography>
        <Card>
          <CardContent>
            <Typography variant="body1">Material Inventory Summary</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={materials}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </BaseLayout>
  );
};

export default CoordinatorDashboard;
