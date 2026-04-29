<?php
defined('BASEPATH') or exit('No direct script access allowed');

class Dashboard_model extends CI_Model
{
    public function __construct()
    {
        parent::__construct();
    }

    public function getPersonalInsights($userId)
    {
        $this->db->select('a.alumni_id, a.is_active_winner, ap.degrees, ap.certifications, ap.professional_courses, ap.employment_history, ap.licenses, ap.profile_image, ap.linkedin_url');
        $this->db->from('alumni a');
        $this->db->join('alumni_profiles ap', 'ap.alumni_id = a.alumni_id', 'left');
        $this->db->where('a.user_id', $userId);
        $profile = $this->db->get()->row_array();

        if (!$profile) {
            return false;
        }

        $degrees = $this->decodeJsonList($profile['degrees'] ?? null);
        $certs = $this->decodeJsonList($profile['certifications'] ?? null);
        $courses = $this->decodeJsonList($profile['professional_courses'] ?? null);
        $history = $this->decodeJsonList($profile['employment_history'] ?? null);
        $licenses = $this->decodeJsonList($profile['licenses'] ?? null);

        $profileBreakdown = [
            'education' => count($degrees) > 0,
            'certifications' => count($certs) > 0,
            'experience' => count($history) > 0,
            'professionalCourses' => count($courses) > 0,
            'licenses' => count($licenses) > 0,
        ];

        $completedSections = array_sum(array_map(static function ($value) {
            return $value ? 1 : 0;
        }, $profileBreakdown));

        $profileCompletion = (int) round(($completedSections / count($profileBreakdown)) * 100);
        $alumniId = (int) $profile['alumni_id'];
        $wins = $this->countBids($alumniId, 'WON');
        $totalBids = $this->countBids($alumniId);

        return [
            'totalAlumni' => (int) $this->db->count_all('alumni'),
            'profileCompletion' => $profileCompletion,
            'monthlyBidWins' => $this->countMonthlyBidWins($alumniId),
            'activeBidders' => $this->countActiveBidders(),
            'skills' => $this->extractTopSkills($profile, 6),
            'profileBreakdown' => $profileBreakdown,
            'detailedProfile' => [
                'degrees' => $degrees,
                'certifications' => $certs,
                'professionalCourses' => $courses,
                'employmentHistory' => $history,
                'licenses' => $licenses,
            ],
            'profile_image' => $profile['profile_image'] ?? null,
            'linkedin_url' => $profile['linkedin_url'] ?? null,
            'biddingStats' => [
                'wins' => $wins,
                'totalBids' => $totalBids,
                'winRate' => $totalBids > 0 ? (int) round(($wins / $totalBids) * 100) : 0,
                'activeWinner' => (bool) ($profile['is_active_winner'] ?? 0),
            ],
        ];

    }

    public function getGlobalInsights()
    {
        return [
            'totalAlumni' => (int) $this->db->count_all('alumni'),
            'topSkills' => $this->extractGlobalTopSkills(6),
            'topOccupations' => $this->aggregateOccupations(6),
            'topCertifications' => $this->aggregateJsonColumn('certifications', 6, 'name'),
            'topCourses' => $this->aggregateCourses(6),
            'topDegrees' => $this->aggregateJsonColumn('degrees', 6, 'title'),
        ];
    }

    private function extractGlobalTopSkills($limit = 6)
    {
        $profiles = $this->db->select('degrees, certifications, professional_courses, employment_history')->get('alumni_profiles')->result_array();
        $all_counts = [];

        $keywords = [
            'React', 'Next.js', 'JavaScript', 'TypeScript', 'Java', 'PHP', 'Python',
            'Data Science', 'Cloud', 'AWS', 'DevOps', 'AI', 'Machine Learning',
            'Project Management', 'Business Analysis', 'Leadership', 'Finance', 'BSc', 'IT', 'Analyst'
        ];

        foreach ($profiles as $profile) {
            $sources = array_merge(
                $this->decodeJsonList($profile['degrees'] ?? null),
                $this->decodeJsonList($profile['certifications'] ?? null),
                $this->decodeJsonList($profile['professional_courses'] ?? null),
                $this->decodeJsonList($profile['employment_history'] ?? null)
            );

            foreach ($sources as $source) {
                $text = is_array($source) ? implode(' ', array_values($source)) : (string) $source;
                $matched = false;
                foreach ($keywords as $keyword) {
                    if (stripos($text, $keyword) !== false) {
                        $all_counts[$keyword] = ($all_counts[$keyword] ?? 0) + 1;
                        $matched = true;
                    }
                }
            }
        }

        return $this->formatCounts($all_counts, $limit);
    }

    private function countMonthlyBidWins($alumniId)
    {
        $this->db->from('Bid b');
        $this->db->join('Slot s', 's.slot_id = b.slot_id');
        $this->db->where('b.alumni_id', $alumniId);
        $this->db->where('b.status', 'WON');
        $this->db->where('MONTH(s.slot_date)', (int) date('m'), false);
        $this->db->where('YEAR(s.slot_date)', (int) date('Y'), false);
        return (int) $this->db->count_all_results();
    }

    private function countBids($alumniId, $status = null)
    {
        $this->db->from('Bid');
        $this->db->where('alumni_id', $alumniId);
        if ($status !== null) {
            $this->db->where('status', $status);
        }
        return (int) $this->db->count_all_results();
    }

    private function countActiveBidders()
    {
        $this->db->distinct();
        $this->db->select('alumni_id');
        $this->db->from('Bid');
        $this->db->where_in('status', ['ACTIVE', 'WON']);
        return (int) $this->db->count_all_results();
    }

    private function aggregateJsonColumn($column, $limit = 6, $key = 'name')
    {
        $rows = $this->db->select($column)->get('alumni_profiles')->result_array();
        $counts = [];

        foreach ($rows as $row) {
            foreach ($this->decodeJsonList($row[$column] ?? null) as $item) {
                $value = is_array($item) ? ($item[$key] ?? '') : $item;
                $label = $this->normalizeLabel($value);
                if ($label === '') {
                    continue;
                }
                $counts[$label] = ($counts[$label] ?? 0) + 1;
            }
        }

        return $this->formatCounts($counts, $limit);
    }

    private function aggregateCourses($limit = 6)
    {
        $rows = $this->db->select('professional_courses')->get('alumni_profiles')->result_array();
        $counts = [];

        foreach ($rows as $row) {
            foreach ($this->decodeJsonList($row['professional_courses'] ?? null) as $course) {
                $value = is_array($course) ? ($course['name'] ?? '') : $course;
                $label = $this->normalizeLabel($value);
                if ($label === '') {
                    continue;
                }
                $counts[$label] = ($counts[$label] ?? 0) + 1;
            }
        }

        $items = $this->formatCounts($counts, $limit);
        foreach ($items as &$item) {
            $item['provider'] = $this->detectProvider($item['label']);
        }

        return $items;
    }

    private function aggregateOccupations($limit = 6)
    {
        $rows = $this->db->select('employment_history')->get('alumni_profiles')->result_array();
        $counts = [];

        foreach ($rows as $row) {
            foreach ($this->decodeJsonList($row['employment_history'] ?? null) as $historyItem) {
                $label = $this->extractOccupation($historyItem);
                if ($label === '') {
                    continue;
                }
                $counts[$label] = ($counts[$label] ?? 0) + 1;
            }
        }

        return $this->formatCounts($counts, $limit);
    }

    private function formatCounts(array $counts, $limit)
    {
        arsort($counts);
        $items = [];
        $maxCount = empty($counts) ? 0 : max($counts);

        foreach (array_slice($counts, 0, $limit, true) as $label => $count) {
            $items[] = [
                'label' => $label,
                'count' => (int) $count,
                'trend' => $count >= $maxCount && $count > 1 ? 'up' : ($count > 1 ? 'steady' : 'new'),
            ];
        }

        return array_values($items);
    }

    private function extractTopSkills(array $profile, $limit = 6)
    {
        $sources = array_merge(
            $this->decodeJsonList($profile['degrees'] ?? null),
            $this->decodeJsonList($profile['certifications'] ?? null),
            $this->decodeJsonList($profile['professional_courses'] ?? null),
            $this->decodeJsonList($profile['employment_history'] ?? null)
        );

        $keywords = [
            'React', 'Next.js', 'JavaScript', 'TypeScript', 'Java', 'PHP', 'Python',
            'Data Science', 'Cloud', 'AWS', 'DevOps', 'AI', 'Machine Learning',
            'Project Management', 'Business Analysis', 'Leadership', 'Finance', 'BSc', 'IT', 'Analyst'
        ];

        $counts = [];

        foreach ($sources as $source) {
            $text = is_array($source) ? implode(' ', array_values($source)) : (string) $source;
            $matched = false;
            foreach ($keywords as $keyword) {
                if (stripos($text, $keyword) !== false) {
                    $counts[$keyword] = ($counts[$keyword] ?? 0) + 1;
                    $matched = true;
                }
            }
        }

        return $this->formatCounts($counts, $limit);
    }

    private function extractOccupation($item)
    {
        $value = is_array($item) ? ($item['position'] ?? '') : (string) $item;
        $label = trim((string) preg_split('/\s+(at|@|-|,)\s+/i', (string) $value)[0]);
        return $this->normalizeLabel($label);
    }

    private function detectProvider($value)
    {
        $providers = ['Coursera', 'Udemy', 'LinkedIn Learning', 'edX', 'Pluralsight'];
        foreach ($providers as $provider) {
            if (stripos($value, $provider) !== false) {
                return $provider;
                }
        }

        return 'Independent';
    }

    private function hasContent($json)
    {
        return count($this->decodeJsonList($json)) > 0;
    }

    private function decodeJsonList($json)
    {
        if (empty($json)) {
            return [];
        }

        $decoded = json_decode($json, true);
        if (!is_array($decoded)) {
            return [];
        }

        return array_values(array_filter($decoded, function ($item) {
            return !empty($item);
        }));
    }

    private function normalizeLabel($value)
    {
        $label = trim(preg_replace('/\s+/', ' ', (string) $value));
        return mb_substr($label, 0, 40);
    }
}

