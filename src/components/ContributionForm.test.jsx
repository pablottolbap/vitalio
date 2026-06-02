
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContributionForm from './ContributionForm.jsx';
import { LanguageProvider } from '../i18n.jsx';
import { ThemeProvider } from '../theme.jsx';

vi.mock('@hcaptcha/react-hcaptcha', () => ({
  default: () => null,
}));

function renderForm(props = {}) {
  const onClose = props.onClose ?? vi.fn();
  return {
    onClose,
    ...render(
      <LanguageProvider>
        <ThemeProvider>
          <ContributionForm open={props.open ?? true} onClose={onClose} />
        </ThemeProvider>
      </LanguageProvider>
    ),
  };
}

const VALID_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const VALID_CHANNEL_URL = 'https://www.youtube.com/@testchannel';

describe('ContributionForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const store = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] ?? null),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    });
  });

  describe('visibility', () => {
    it('renders the form dialog when open=true', () => {
      renderForm({ open: true });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders nothing when open=false', () => {
      renderForm({ open: false });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('close behaviour', () => {
    it('calls onClose when the × button is clicked', () => {
      const { onClose } = renderForm();
      fireEvent.click(screen.getByRole('button', { name: /zamknij|close/i }));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('calls onClose when the backdrop is clicked', () => {
      const { onClose } = renderForm();
      const backdrop = screen.getByRole('dialog').parentElement;
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('video URL validation', () => {
    it('shows an error for an invalid video URL', () => {
      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      fireEvent.change(urlInput, { target: { value: 'https://invalid.com/video' } });
      expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
    });

    it('accepts a youtu.be shortlink', () => {
      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      fireEvent.change(urlInput, { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } });
      expect(screen.queryByText(/invalid format/i)).not.toBeInTheDocument();
    });

    it('normalizes youtu.be shortlink to canonical URL on blur', () => {
      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      fireEvent.change(urlInput, { target: { value: 'https://youtu.be/dQw4w9WgXcQ' } });
      fireEvent.blur(urlInput);
      expect(urlInput.value).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });

    it('strips tracking params from youtu.be link on blur', () => {
      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      fireEvent.change(urlInput, { target: { value: 'https://youtu.be/ZWvJkq3XqqA?si=pZv96lCDSMtRRGsh' } });
      fireEvent.blur(urlInput);
      expect(urlInput.value).toBe('https://www.youtube.com/watch?v=ZWvJkq3XqqA');
    });

    it('clears the video URL error when a valid URL is entered', () => {
      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      fireEvent.change(urlInput, { target: { value: 'https://youtu.be/bad' } });
      expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
      fireEvent.change(urlInput, { target: { value: VALID_VIDEO_URL } });
      expect(screen.queryByText(/invalid format/i)).not.toBeInTheDocument();
    });

    it('does not normalize empty video URL on blur', () => {
      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      fireEvent.change(urlInput, { target: { value: '   ' } });
      fireEvent.blur(urlInput);
      expect(urlInput.value).toBe('');
    });

    it('disables the submit button when the video URL is invalid', () => {
      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      fireEvent.change(urlInput, { target: { value: 'https://youtu.be/bad' } });
      expect(screen.getByRole('button', { name: /wyślij|send proposal/i })).toBeDisabled();
    });
  });

  describe('channel URL validation', () => {
    it('shows an error for an invalid channel URL', () => {
      renderForm();
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);
      fireEvent.change(channelInput, { target: { value: 'https://www.youtube.com/c/channel' } });
      expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
    });

    it('accepts a channel URL without www', () => {
      renderForm();
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);
      fireEvent.change(channelInput, { target: { value: 'https://youtube.com/@testchannel' } });
      expect(screen.queryByText(/invalid format/i)).not.toBeInTheDocument();
    });

    it('normalizes non-www channel URL to canonical on blur', () => {
      renderForm();
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);
      fireEvent.change(channelInput, { target: { value: 'https://youtube.com/@testchannel' } });
      fireEvent.blur(channelInput);
      expect(channelInput.value).toBe('https://www.youtube.com/@testchannel');
    });

    it('strips tracking params from channel URL on blur', () => {
      renderForm();
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);
      fireEvent.change(channelInput, { target: { value: 'https://www.youtube.com/@infouprawa5321?si=-P7YviRue4LI_DOS' } });
      fireEvent.blur(channelInput);
      expect(channelInput.value).toBe('https://www.youtube.com/@infouprawa5321');
    });

    it('clears the channel URL error when a valid URL is entered', () => {
      renderForm();
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);
      fireEvent.change(channelInput, { target: { value: 'https://www.youtube.com/c/bad' } });
      expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
      fireEvent.change(channelInput, { target: { value: VALID_CHANNEL_URL } });
      expect(screen.queryByText(/invalid format/i)).not.toBeInTheDocument();
    });

    it('does not normalize empty channel URL on blur', () => {
      renderForm();
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);
      fireEvent.change(channelInput, { target: { value: '   ' } });
      fireEvent.blur(channelInput);
      expect(channelInput.value).toBe('');
    });

    it('disables the submit button when the channel URL is invalid', () => {
      renderForm();
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);
      fireEvent.change(channelInput, { target: { value: 'https://www.youtube.com/c/bad' } });
      expect(screen.getByRole('button', { name: /wyślij|send proposal/i })).toBeDisabled();
    });
  });

  describe('form field interactions', () => {
    it('changes the type selector to podcast', () => {
      renderForm();
      const typeSelect = screen.getByRole('combobox');
      fireEvent.change(typeSelect, { target: { value: 'podcast' } });
      expect(typeSelect.value).toBe('podcast');
    });

    it('changes the type selector to qa', () => {
      renderForm();
      const typeSelect = screen.getByRole('combobox');
      fireEvent.change(typeSelect, { target: { value: 'qa' } });
      expect(typeSelect.value).toBe('qa');
    });

    it('clicking the EN language button updates the selection', () => {
      renderForm();
      const enButton = screen.getByRole('button', { name: /english en/i });
      fireEvent.click(enButton);
      expect(enButton).toBeInTheDocument();
    });

    it('typing in the topics field updates its value', () => {
      renderForm();
      const topicsInput = screen.getByPlaceholderText(/diet, carnivore, basics/i);
      fireEvent.change(topicsInput, { target: { value: 'diet, keto' } });
      expect(topicsInput.value).toBe('diet, keto');
    });

    it('typing in the guests field updates its value', () => {
      renderForm();
      const guestsInput = screen.getByPlaceholderText(/jan kowalski, anna nowak/i);
      fireEvent.change(guestsInput, { target: { value: 'Anna Nowak' } });
      expect(guestsInput.value).toBe('Anna Nowak');
    });

    it('includes series name and order in submission payload when provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true }),
      });
      vi.stubGlobal('fetch', fetchMock);

      renderForm();
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i), { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i), { target: { value: VALID_CHANNEL_URL } });

      const inputs = screen.getAllByRole('textbox');
      const seriesNameInput = inputs[inputs.length - 2];
      const seriesOrderInput = screen.getByRole('spinbutton');
      fireEvent.change(seriesNameInput, { target: { value: 'Test Series' } });
      fireEvent.change(seriesOrderInput, { target: { value: '5' } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalled(),
        { timeout: 3000 }
      );

      const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
      const entry = JSON.parse(payload.message);
      expect(entry.series).toBeDefined();
      expect(entry.series.name).toBe('Test Series');
      expect(entry.series.order).toBe(5);
    });
  });

  describe('daily limit', () => {
    it('shows daily limit message when 5 submissions were made today', async () => {
      const today = new Date().toISOString();
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key) =>
          key === 'vitalio-form-submissions'
            ? JSON.stringify(Array(5).fill(today))
            : null
        ),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      });

      renderForm();

      await waitFor(() => {
        expect(screen.getByText(/osiągnąłeś limit|reached the limit/i)).toBeInTheDocument();
      });

      vi.unstubAllGlobals();
    });

    it('hides the form when daily limit is reached', async () => {
      const today = new Date().toISOString();
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key) =>
          key === 'vitalio-form-submissions'
            ? JSON.stringify(Array(5).fill(today))
            : null
        ),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      });

      renderForm();

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /wyślij|send proposal/i })).not.toBeInTheDocument();
      });

      vi.unstubAllGlobals();
    });

    it('shows GitHub Discussion link in daily limit block', async () => {
      const today = new Date().toISOString();
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key) =>
          key === 'vitalio-form-submissions'
            ? JSON.stringify(Array(5).fill(today))
            : null
        ),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      });

      renderForm();

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /wolisz github|prefer github/i })).toBeInTheDocument();
      });

      vi.unstubAllGlobals();
    });

    it('shows submission count hint when form is open', async () => {
      const today = new Date().toISOString();
      vi.stubGlobal('localStorage', {
        getItem: vi.fn((key) =>
          key === 'vitalio-form-submissions'
            ? JSON.stringify([today])
            : null
        ),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      });

      renderForm();

      await waitFor(() => {
        expect(screen.getByText(/submitted: 1 \/ 5|wykorzystany limit: 1 \/ 5/i)).toBeInTheDocument();
      });

      vi.unstubAllGlobals();
    });
  });

  describe('form submission — validation errors', () => {
    it('prevents submission and shows errors when video URL is invalid', async () => {
      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);

      fireEvent.change(urlInput, { target: { value: 'https://invalid.com/video' } });
      fireEvent.change(channelInput, { target: { value: VALID_CHANNEL_URL } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
    });

    it('prevents submission and shows errors when channel URL is invalid', async () => {
      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);

      fireEvent.change(urlInput, { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(channelInput, { target: { value: 'https://invalid.com/channel' } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      expect(screen.getByText(/invalid format/i)).toBeInTheDocument();
    });

    it('prevents submission when both URLs are invalid', async () => {
      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);

      fireEvent.change(urlInput, { target: { value: 'https://invalid.com/video' } });
      fireEvent.change(channelInput, { target: { value: 'https://invalid.com/channel' } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      const errors = screen.getAllByText(/invalid format/i);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    it('sends null series when series name is not provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true }),
      });
      vi.stubGlobal('fetch', fetchMock);

      renderForm();
      const urlInput = screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i);
      const channelInput = screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i);

      fireEvent.change(urlInput, { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(channelInput, { target: { value: VALID_CHANNEL_URL } });

      const inputs = screen.getAllByRole('textbox');
      const seriesNameInput = inputs[inputs.length - 2];
      fireEvent.change(seriesNameInput, { target: { value: '' } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalled(),
        { timeout: 3000 }
      );

      const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
      const entry = JSON.parse(payload.message);
      expect(entry.series).toBeNull();
    });
  });

  describe('form submission', () => {
    it('shows a success message after a successful submission', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true }),
      }));

      renderForm();

      // Fill required fields with valid data
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i), { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i), { target: { value: VALID_CHANNEL_URL } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      await waitFor(() =>
        expect(screen.getByText(/dziękujemy|thank you/i)).toBeInTheDocument()
      );
    });

    it('shows an error message when the API returns failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: false }),
      }));

      renderForm();

      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i), { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i), { target: { value: VALID_CHANNEL_URL } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      await waitFor(() =>
        expect(screen.getByText(/coś poszło nie tak|something went wrong/i)).toBeInTheDocument()
      );
    });

    it('shows an error message when the fetch call throws', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      renderForm();

      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i), { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i), { target: { value: VALID_CHANNEL_URL } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      await waitFor(() =>
        expect(screen.getByText(/coś poszło nie tak|something went wrong/i)).toBeInTheDocument()
      );
    });

    it('shows success message after successful submission', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true }),
      }));

      renderForm();

      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i), { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i), { target: { value: VALID_CHANNEL_URL } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      await waitFor(() => {
        expect(screen.getByText(/dziękujemy|thank you/i)).toBeInTheDocument();
      });
    });
  });

  describe('keyboard interaction', () => {
    it('closes the form when Escape key is pressed', () => {
      const { onClose } = renderForm();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('does not close when Escape is pressed and form is closed', () => {
      const { onClose } = renderForm({ open: false });
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('form submit button states', () => {
    it('enables submit button after hCaptcha token is received', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true }),
      }));

      renderForm();
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i), { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i), { target: { value: VALID_CHANNEL_URL } });

      await waitFor(() => {
        const submitBtn = screen.getByRole('button', { name: /wyślij|send proposal/i });
        expect(submitBtn).not.toBeDisabled();
      });
    });

    it('completes submission with valid URLs', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true }),
      }));

      renderForm();
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i), { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i), { target: { value: VALID_CHANNEL_URL } });

      await waitFor(() => {
        const submitBtn = screen.getByRole('button', { name: /wyślij|send proposal/i });
        expect(submitBtn).toBeInTheDocument();
      });
    });

    it('auto-resets form after successful submission', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true }),
      }));

      renderForm();
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i), { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i), { target: { value: VALID_CHANNEL_URL } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      await waitFor(() =>
        expect(screen.getByText(/dziękujemy|thank you/i)).toBeInTheDocument(),
        { timeout: 3000 }
      );

      await waitFor(() => {
        expect(screen.queryByText(/dziękujemy|thank you/i)).not.toBeInTheDocument();
        expect(screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i).value).toBe('');
      }, { timeout: 5000 });
    });

    it('sends id field in submitted payload', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true }),
      });
      vi.stubGlobal('fetch', fetchMock);

      renderForm();
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/watch.*youtu\.be/i), { target: { value: VALID_VIDEO_URL } });
      fireEvent.change(screen.getByPlaceholderText(/youtube\.com\/@.*youtube\.com/i), { target: { value: VALID_CHANNEL_URL } });

      fireEvent.submit(screen.getByRole('dialog').querySelector('form'));

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalled(),
        { timeout: 3000 }
      );

      const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
      const entry = JSON.parse(payload.message);
      expect(entry).toHaveProperty('id');
      expect(entry.id).toBeTruthy();
    });
  });

});
