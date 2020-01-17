#!/bin/sh

# The script updates the chs configs environments for promise-to-file-web,
# the idea is to avoid manually having to go to each environment and update, instead we can update from a standard template.
# An argument is passed in "dev", "live" or "all", further custom lists can be added.

# A list is selected from the releveant argument file "dev" etc and added to a path for the environments selected,
# the promise-to-file-web config is then updated in that enviroment using the template_env file which overwrites the content if the file exists.
# If the file does not exist it creates the file with the content.

# The user types in the shell file name with sh on the command line together with an argument "dev", "live" or "all".
# The user is then prompted to ensure that they have checked out a branch in chs configs
# and to check that they have correctly selected dev/live/all.

FILE="./env_template"
CONFIG_DIR="../../chs-configs"
APP_DIR="promise-to-file-web"

update()
{
	if [ ${#environments[@]} -gt 0 ]; then 
		for environment in "${environments[@]}"
		do
			path="$CONFIG_DIR/$environment/$APP_DIR/env"
			if [ -f $path ]; then
			    cat $FILE > $path
			    echo "Replaced content of file $path with content";
			else
			    cat $FILE >> $path
			    echo "Create new file $path";
		    fi
		done    
	else 
		echo "No config files updated or created please check content of $1"
	fi
}

run()
{
	if [ "$1" = "dev" ]; then
		 environments=()
	     index=0
	     while read line
	     do
	        environments[$index]=$line
	        index=$((index+1))
	     done < dev	
	     update environments
	elif [ "$1" = "live" ]; then
		 environments=(environments)
	     index=0
		 while read line
	     do
	        environments[ $index ] = $line
	        index=$((index+1))
	     done < /live
	     update environments
	elif [ "$1" = "all" ]; then
		 environments=(environments)
	     index=0
		 while read line
	     do
	         environments[ $index ] = $line
	         index=$((index+1))
	     done < /all
	     update environments
	else
		echo "No updates made - single parameter dev|live|all required"
	fi

}

echo "Ensure that you have a branch checked out from develop in chs configs"
echo "Also you have selected <$1>, ensure that this correct"
while true; do
    read -p "Do you wish to continue?" yn
    case $yn in
        [Yy]* ) run $1; break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done


