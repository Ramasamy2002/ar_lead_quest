import React, { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface DataItem {
  _id: string;
  name: string;
  email: string;
  url: string;
  createdAt: string;
}

function Dashboard() {
  const [data, setData] = useState<DataItem[]>([]);
  const { token } = useAuth();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/data', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          

        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);
  console.log(data);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center mb-4">
                <Database className="h-6 w-6 text-indigo-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">
                  Stored Data
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {item.url}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;