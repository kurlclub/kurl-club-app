import ProfilePictureUploader from '@/components/shared/uploaders/profile-uploader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { getAvatarColor, getInitials } from '@/lib/avatar-utils';
import { base64ToFile } from '@/lib/utils';
import { EditableSectionProps } from '@/types/members';

export function MemberHeader({
  isEditing,
  details,
  onUpdate,
}: EditableSectionProps) {
  return (
    <>
      <div className="items-center mb-4">
        <div className="mb-3">
          {isEditing ? (
            <ProfilePictureUploader
              files={
                details?.profilePicture instanceof File
                  ? details.profilePicture
                  : details?.profilePicture
                    ? base64ToFile(details.profilePicture, 'profile.png')
                    : null
              }
              onChange={(file) => {
                if (file) {
                  onUpdate('profilePicture', file);
                } else {
                  onUpdate('profilePicture', null);
                }
              }}
              existingImageUrl={details?.photoPath || undefined}
              isSmall
            />
          ) : (
            <Avatar className="size-[64px]">
              <AvatarImage
                src={
                  details?.photoPath ||
                  (details?.profilePicture
                    ? `data:image/png;base64,${details.profilePicture}`
                    : undefined)
                }
                alt="Profile picture"
              />
              <AvatarFallback
                className="font-medium text-xl leading-normal"
                style={getAvatarColor(details?.name || '')}
              >
                {getInitials(details?.name || '')}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <div>
          {isEditing ? (
            <div className="flex items-center pb-1.5 border-b gap-2 border-primary-blue-300 group focus-within:border-white hover:border-white k-transition">
              <Input
                value={details?.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className="border-0 font-medium rounded-none h-auto p-0 text-[20px]! focus-visible:outline-0 focus-visible:ring-0"
              />
            </div>
          ) : (
            <h6 className="text-xl font-medium text-white">{details?.name}</h6>
          )}
          <p className="text-sm text-primary-blue-50 mt-1">
            Member since {details?.doj}
          </p>
        </div>
      </div>
      <Badge className="bg-neutral-ochre-500 flex items-center w-fit justify-center text-sm rounded-full h-[30px] py-[8.5px] px-4 border border-neutral-ochre-800 bg-opacity-10">
        Member ID:{' '}
        <span className="uppercase ml-1">{details?.memberIdentifier}</span>
      </Badge>
    </>
  );
}
